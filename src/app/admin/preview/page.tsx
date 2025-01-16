import { PreviewWrapper } from "./PreviewWrapper";

export default function PreviewPage() {
  return (
    <main className="max-w-7xl mx-auto pb-8">
      <div className="p-4 mb-4 bg-yellow-50 border-l-4 border-yellow-400">
        <p className="text-yellow-700">
          This is a preview of your current layout. Changes are not saved until
          you click &quot;Save Layout&quot; in the admin panel.
        </p>
      </div>
      <PreviewWrapper />
    </main>
  );
}
