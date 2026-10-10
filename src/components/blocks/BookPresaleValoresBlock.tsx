"use client";
import Image from "next/image";

const COVER_URL =
  "https://cdn.shopify.com/s/files/1/0932/3439/7528/files/C01CA6F7-2161-4A17-944D-74CEF7837B3F.jpg?v=1791514716";
const SHOP_URL =
  "https://paginaum.myshopify.com/products/valores-em-vez-de-ideologias?variant=58702029422936";

export function BookPresaleValoresBlock() {
  return (
    <a
      href={SHOP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="block h-full w-full bg-gradient-to-br border border-red-300 rounded-lg shadow-lg p-4 transition-transform duration-200 group book-presale-link to-red-100 from-stone-50"
      style={{ textDecoration: "none" }}
    >
      <div
        className="h-full w-full flex items-center justify-center gap-4 book-presale-container"
        style={{ minHeight: 0, minWidth: 0 }}
      >
        <div className="flex-shrink-0 flex items-center justify-center w-auto max-w-[180px] book-presale-cover-wrapper">
          <Image
            src={COVER_URL}
            alt="Capa do livro Valores em vez de Ideologias"
            className="rounded book-presale-cover"
            width={160}
            height={220}
            sizes="(max-width: 520px) 180px, 160px"
          />
        </div>
        <div className="flex flex-col items-center md:items-start justify-center flex-1 min-w-0 book-presale-content">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-red-900 mb-1 drop-shadow-sm text-center md:text-left break-words">
            Valores em vez de Ideologias
          </h2>
          <div className="text-red-800 text-lg md:text-xl font-medium italic mb-2 text-center md:text-left">
            de Pedro Almeida Vieira.
          </div>
          <div className="text-stone-700 text-base md:text-lg font-normal mb-2 text-center md:text-left">
            <span className="inline-block px-2 py-1 bg-red-200 rounded-full font-bold text-red-900 border border-red-400 cursor-pointer">
              Em pré-venda
            </span>
          </div>
        </div>
      </div>
      <style>{`
        .book-presale-link {
          box-sizing: border-box;
          overflow: hidden;
          container-type: inline-size;
          container-name: book;
          display: block;
          width: 100%;
          height: 100%;
        }

        .book-presale-container {
          display: flex;
          flex-direction: column;
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          overflow: hidden;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 0;
        }

        @container book (min-width: 520px) {
          .book-presale-container {
            flex-direction: row;
            align-items: flex-start;
            justify-content: flex-start;
            gap: 1rem;
          }

          .book-presale-cover-wrapper {
            flex: 0 0 160px;
            width: 160px;
            max-width: 180px;
            height: auto;
            align-self: flex-start;
          }

          .book-presale-content {
            flex: 1 1 auto;
            min-width: 0;
            align-items: flex-start;
            text-align: left;
          }

          .book-presale-cover {
            max-height: 220px;
            width: 100%;
            object-fit: contain;
            display: block;
          }
        }

        @container book (min-aspect-ratio: 3/2) {
          .book-presale-container {
            flex-direction: row;
            align-items: flex-start;
            gap: 1.25rem;
          }

          .book-presale-cover-wrapper {
            flex: 0 0 160px;
            width: 160px;
            max-width: 180px;
          }

          .book-presale-content {
            flex: 1 1 auto;
          }

          .book-presale-cover {
            max-height: 220px;
            object-fit: contain;
          }
        }

        .book-presale-cover-wrapper img {
          max-width: 100%;
          height: auto;
          display: block;
        }
      `}</style>
    </a>
  );
}
