import React from "react";
import { CategoryBlockCreator } from "./CategoryBlockCreator";
import { StaticBlockCreator } from "./StaticBlockCreator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/Tabs";

interface BlocksTabsProps {
  onCreateCategoryBlock: (categoryId: number, title: string) => void;
  onCreateStaticBlock: (title: "newsletter" | "podcast" | "divider") => void;
}

export function BlocksTabs({
  onCreateCategoryBlock,
  onCreateStaticBlock,
}: BlocksTabsProps) {
  const [activeTab, setActiveTab] = React.useState("category");

  return (
    <div>
      <TabsList activeTab={activeTab} setActiveTab={setActiveTab}>
        <TabsTrigger value="category">Blocos de Categoria</TabsTrigger>
        <TabsTrigger value="static">Blocos Estáticos</TabsTrigger>
      </TabsList>

      <div className="mt-4">
        <TabsContent value="category" activeTab={activeTab}>
          <CategoryBlockCreator onCreateBlock={onCreateCategoryBlock} />
        </TabsContent>

        <TabsContent value="static" activeTab={activeTab}>
          <StaticBlockCreator onCreateBlock={onCreateStaticBlock} />
        </TabsContent>
      </div>
    </div>
  );
}
