"use client";

import React, { useEffect, useState } from "react";
import { useQuery, gql } from "@keystone-6/core/admin-ui/apollo";
import {
  ChevronDownIcon,
  Circle,
  EllipsisVertical,
  Square,
  Triangle,
  Webhook,
} from "lucide-react";
import {
  DescriptionDetails,
  DescriptionList,
  DescriptionTerm,
} from "@ui/description-list";
import {
  differenceInHours,
  format,
  parseISO,
  differenceInMinutes,
} from "date-fns";
import { Skeleton } from "@ui/skeleton";
import { Badge } from "@keystone/themes/Tailwind/atlas/primitives/default/ui/badge";
import { Button } from "@keystone/themes/Tailwind/atlas/primitives/default/ui/button";
import { Webhooks } from "./Webhooks";
import { Avatar } from "@keystone/themes/Tailwind/atlas/primitives/default/ui/avatar";
import { Squircle } from "@squircle-js/react";
import {
  Cog6ToothIcon,
  Cog8ToothIcon,
  CogIcon,
  LinkIcon,
  Square2StackIcon,
  Square3Stack3DIcon,
  TicketIcon,
} from "@heroicons/react/16/solid";
import { Links } from "./Links";
import { RiCalculatorLine, RiMapPin2Line } from "@remixicon/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/tabs";
import { SearchOrders } from "./SearchOrders";

export const SHOPS_QUERY = gql`
  query (
    $where: ShopWhereInput
    $take: Int!
    $skip: Int!
    $orderBy: [ShopOrderByInput!]
  ) {
    items: shops(where: $where, take: $take, skip: $skip, orderBy: $orderBy) {
      id
      name
      platform {
        name
      }
      linkMode
      links(orderBy: [{ rank: asc }]) {
        id
        rank
        channel {
          id
          name
        }
        filters
      }
      ordersCount
      shopItemsCount
      linksCount
      createdAt
      updatedAt
    }
    count: shopsCount(where: $where)
  }
`;

function formatDate(dateString) {
  const date = parseISO(dateString);
  const now = new Date();
  const minutesDifference = differenceInMinutes(now, date);
  const hoursDifference = differenceInHours(now, date);

  if (minutesDifference < 60) {
    return `${minutesDifference} minutes ago`;
  } else if (hoursDifference < 24) {
    return `${hoursDifference} hours ago`;
  } else {
    return format(date, "PPP");
  }
}

export const Shops = ({ openDrawer, selectedPlatform }) => {
  const { data, loading, error, refetch } = useQuery(SHOPS_QUERY, {
    variables: {
      where: selectedPlatform
        ? { platform: { id: { equals: selectedPlatform } } }
        : { OR: [] },
      take: 50,
      skip: 0,
    },
  });

  useEffect(() => {
    refetch();
  }, [selectedPlatform]);

  const [showAll, setShowAll] = useState(false);

  if (loading) {
    return (
      <div className="grid gap-3">
        {Array(3)
          .fill(0)
          .map((_, index) => (
            <div
              key={index}
              className="py-4 overflow-hidden rounded-xl border flex flex-col gap-5 relative dark:bg-black dark:border-white/15"
            >
              <div className="px-4 flex items-start gap-4">
                <Skeleton className="h-14 w-14 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
              <div className="px-4">
                <div className="flex space-x-2">
                  {["Orders", "Matches", "Links", "Webhooks"].map((tab, i) => (
                    <Skeleton key={i} className="h-8 w-20" />
                  ))}
                </div>
              </div>
            </div>
          ))}
      </div>
    );
  }

  if (error) return <p>Error loading shops: {error.message}</p>;

  const shopItems = data.items;

  return (
    <div>
      {!showAll && shopItems.length > 6 && (
        <div className="z-10 bg-gradient-to-t from-white to-transparent dark:from-zinc-950 dark:to-transparent absolute bottom-0 left-0 right-0 h-36 pointer-events-none" />
      )}
      {shopItems.length ? (
        <div className="relative grid gap-3">
          {shopItems.slice(0, showAll ? shopItems.length : 6).map((shop) => (
            <div key={shop.id} className="flex flex-col -space-y-4">
              <div className="overflow-hidden rounded-xl pt-4 border flex flex-col gap-5 relative *:relative dark:bg-black dark:border-white/15 before:absolute before:inset-0 before:border-white before:from-zinc-100 dark:before:border-white/20 before:bg-gradient-to-bl dark:before:from-zinc-500/15 dark:before:to-transparent before:shadow dark:before:shadow-zinc-950">
                <div className="px-4 flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="self-start">
                    <Badge
                      color="teal"
                      className="uppercase tracking-wide border-2 text-xl flex items-center justify-center w-14 h-14 font-medium rounded-[calc(theme(borderRadius.xl)-1px)]"
                    >
                      {shop.name.slice(0, 2)}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <h3 className="mr-2">{shop.name}</h3>
                    </div>

                    <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-sm">
                      {shop.platform ? (
                        <div className="text-muted-foreground/75 flex items-center gap-2">
                          <div className="rounded-full text-teal-400 bg-teal-400/20 dark:text-teal-500 dark:bg-teal-400/20 p-1">
                            <div className="h-2 w-2 rounded-full bg-current" />
                          </div>
                          {shop.platform.name}
                        </div>
                      ) : (
                        <div className="text-red-500 flex items-center gap-2 font-medium">
                          <div className="rounded-full text-red-400 bg-red-400/20 dark:text-red-400 dark:bg-red-400/10 p-1">
                            <div className="h-2 w-2 rounded-full bg-current" />
                          </div>
                          Platform not connected
                        </div>
                      )}
                      <span className="block size-1 rounded-full bg-muted-foreground/50" />
                      <p className="text-muted-foreground text-sm font-light">
                        Last updated {formatDate(shop.updatedAt)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    className="ml-auto px-1.5"
                    onClick={() => openDrawer(shop.id, "Shop")}
                  >
                    <EllipsisVertical className="size-2.5" />
                  </Button>
                </div>
                <Tabs>
                  <TabsList className="px-4" variant="line">
                    <TabsTrigger value="orders" className="inline-flex gap-2">
                      <TicketIcon className="-ml-1 size-4" aria-hidden="true" />
                      Orders
                      <Badge
                        color="zinc"
                        className="opacity-75 text-[.8rem]/3 px-1.5 border"
                      >
                        {shop.ordersCount}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="matches" className="inline-flex gap-2">
                      <Square2StackIcon
                        className="-ml-1 size-4"
                        aria-hidden="true"
                      />
                      Matches
                      <Badge
                        color="zinc"
                        className="opacity-75 text-[.8rem]/3 px-1.5 border"
                      >
                        {shop.shopItemsCount}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="links" className="inline-flex gap-2">
                      <LinkIcon className="-ml-1 size-4" aria-hidden="true" />
                      Links
                      <Badge
                        color="zinc"
                        className="opacity-75 text-[.8rem]/3 px-1.5 border"
                      >
                        {shop.linksCount}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger
                      value="webhooks"
                      className="inline-flex gap-2 -mb-[3px]"
                    >
                      <Webhook className="-ml-1 size-4" aria-hidden="true" />
                      Webhooks
                    </TabsTrigger>
                  </TabsList>
                  <div className="-mb-1 px-4">
                    <TabsContent value="webhooks">
                      <p className="text-sm text-gray-500 sm:text-gray-500">
                        <div className="mb-3 text-sm text-zinc-500 dark:text-zinc-200">
                          <div className="text-sm text-zinc-500 dark:text-zinc-400">
                            Create platform webhooks to keep Openship in sync
                          </div>
                        </div>
                        <Webhooks shopId={shop.id} />
                      </p>
                    </TabsContent>
                    <TabsContent value="links">
                      <p className="text-sm text-gray-500 sm:text-gray-500">
                        <div>
                          <Links
                            shopId={shop.id}
                            links={shop.links}
                            linkMode={shop.linkMode}
                            refetch={refetch}
                            editItem={openDrawer}
                          />
                        </div>
                      </p>
                    </TabsContent>
                    <TabsContent value="orders">
                      <div className="h-[300px]">
                        {/* Adjust the height as needed */}
                        <SearchOrders
                          shopId={shop.id}
                          searchEntry=""
                          pageSize={10}
                        />
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full">
          <div className="flex flex-col items-center p-10 border-dashed border-2 rounded-lg">
            <div className="flex opacity-40">
              <Triangle className="w-8 h-8 fill-indigo-200 stroke-indigo-400 dark:stroke-indigo-600 dark:fill-indigo-950" />
              <Circle className="w-8 h-8 fill-emerald-200 stroke-emerald-400 dark:stroke-emerald-600 dark:fill-emerald-950" />
              <Square className="w-8 h-8 fill-orange-300 stroke-orange-500 dark:stroke-amber-600 dark:fill-amber-950" />
            </div>

            <span className="pt-4 font-semibold">
              No <span className="lowercase">Shops</span> found
            </span>
            <span className="text-muted-foreground pb-4">
              Get started by creating a new one.
            </span>
          </div>
        </div>
      )}

      {!showAll && shopItems.length > 6 && (
        <div className="col-span-full flex justify-center -mt-4">
          <button
            onClick={() => setShowAll(true)}
            className="text-zinc-950 dark:text-zinc-50 font-medium text-sm"
          >
            Show More
            <ChevronDownIcon />
          </button>
        </div>
      )}
    </div>
  );
};
