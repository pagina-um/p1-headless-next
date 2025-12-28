"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { PostsList } from "./PostsList";
import { CategoriesList } from "./CategoriesList";
import { StaticBlocksList } from "./StaticBlocksList";

export function ContentPicker() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 h-full">
      <h2 className="text-lg font-semibold mb-4">Add Content Blocks</h2>

      <Tabs defaultValue="posts">
        <TabsList>
          <TabsTrigger value="posts">📰 Posts</TabsTrigger>
          <TabsTrigger value="categories">📁 Categories</TabsTrigger>
          <TabsTrigger value="static">🎨 Static</TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <TabsContent value="posts">
            <PostsList />
          </TabsContent>

          <TabsContent value="categories">
            <CategoriesList />
          </TabsContent>

          <TabsContent value="static">
            <StaticBlocksList />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
