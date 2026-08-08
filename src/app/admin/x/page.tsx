import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  getClient,
  GET_LATEST_POSTS_FOR_PROMO,
} from "@/services/wp-graphql";
import { mintAdminToken } from "@/services/admin-token";
import { twitterConfigured } from "@/services/twitter";
import { XPromotionList } from "@/components/admin/XPromotionList";

// The WordPress list must reflect what was published seconds ago.
export const dynamic = "force-dynamic";

export const metadata = { title: "Promoção no X — PÁGINA UM" };

export default async function XPromotionPage() {
  const { data, error } = await getClient()
    .query(GET_LATEST_POSTS_FOR_PROMO, { first: 30 })
    .toPromise();

  const posts = (data?.posts?.nodes ?? []).filter(Boolean);

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="bg-white shadow-lg p-6 mb-6">
        <Link
          href="/admin"
          className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1 mb-3"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao painel
        </Link>
        <h1 className="text-2xl font-bold">Promoção no X</h1>
        <p className="text-sm text-gray-600 mt-2 max-w-2xl">
          Escolha uma das últimas peças publicadas. A publicação é escrita com
          IA, revista por si, e sai com uma imagem da peça. O link não vai na
          publicação principal — segue na primeira resposta, para não penalizar
          o alcance.
        </p>
        {!twitterConfigured() && (
          <p className="text-sm text-red-600 mt-3">
            As chaves do X não estão configuradas — defina X_API_KEY,
            X_API_SECRET, X_ACCESS_TOKEN e X_ACCESS_SECRET.
          </p>
        )}
        {error && (
          <p className="text-sm text-red-600 mt-3">
            Não foi possível carregar as peças do WordPress: {error.message}
          </p>
        )}
      </div>

      <XPromotionList posts={posts} adminToken={mintAdminToken()} />
    </main>
  );
}
