import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  getClient,
  GET_LATEST_POSTS_FOR_PROMO,
} from "@/services/wp-graphql";
import { mintAdminToken } from "@/services/admin-token";
import { facebookConfigured } from "@/services/facebook";
import { FacebookPromotionList } from "@/components/admin/FacebookPromotionList";

// The WordPress list must reflect what was published seconds ago.
export const dynamic = "force-dynamic";

export const metadata = { title: "Promoção no Facebook — PÁGINA UM" };

export default async function FacebookPromotionPage() {
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
        <h1 className="text-2xl font-bold">Promoção no Facebook</h1>
        <p className="text-sm text-gray-600 mt-2 max-w-2xl">
          Escolha uma das últimas peças publicadas. A publicação é escrita com
          IA, revista por si, e sai com o link da peça, que o Facebook mostra
          como cartão com a imagem e o título do artigo.
        </p>
        {!facebookConfigured() && (
          <p className="text-sm text-red-600 mt-3">
            As chaves do Facebook não estão configuradas — defina FB_PAGE_ID e
            FB_PAGE_ACCESS_TOKEN.
          </p>
        )}
        {error && (
          <p className="text-sm text-red-600 mt-3">
            Não foi possível carregar as peças do WordPress: {error.message}
          </p>
        )}
      </div>

      <FacebookPromotionList posts={posts} adminToken={mintAdminToken()} />
    </main>
  );
}
