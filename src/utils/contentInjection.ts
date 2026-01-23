import { StaticBlock } from "@/types";

// Create a donation block for injection
const createDonationBlock = (): StaticBlock => ({
  uId: "donation-mid-article",
  blockType: "static",
  title: "Donation",
  content: "",
  type: "donation",
  gridPosition: { x: 0, y: 0, width: 1, height: 1 },
  mobilePriority: null,
});

// Generate donation block HTML as a string
const getDonationBlockHTML = (): string => {
  return `
    <div class="my-8">
      <div class="donation-block-container h-full p-8 bg-slate-800 shadow-sm block-content relative" style="grid-column: span 1; grid-row: span 1;">
        <style>
          .donation-block-container::before,
          .donation-block-container::after {
            content: '';
            position: absolute;
            top: 0;
            bottom: 0;
            background-color: rgb(30 41 59); /* slate-800 */
            z-index: -1;
          }
          .donation-block-container::before {
            right: 100%;
          }
          .donation-block-container::after {
            left: 100%;
          }
        </style>
        <div class="space-y-4 max-w-4xl mx-auto flex flex-col justify-center h-full text-center relative z-10" style="container-type: inline-size;">
          <div class="space-y-4">
            <p class="font-serif text-lg text-white">
              O jornalismo independente (só) depende dos leitores.
            </p>
            <p class="text-lg text-white">
              Não dependemos de grupos económicos nem do Estado. Não fazemos
              fretes. Fazemos jornalismo para os leitores,
              <strong class="">
                mas só sobreviveremos com o seu apoio financeiro.
              </strong>
            </p>
          </div>
          <div class="pt-4 flex justify-center" style="container: @[400px];">
            <a
              href="/donativos"
              class="group bg-primary hover:bg-primary-dark transition-all duration-300 rounded-lg p-4 text-center flex items-center justify-center space-x-3 w-full max-w-96 mx-0"
            >
              <svg class="w-6 h-6 group-hover:scale-110 transition-transform duration-300 stroke-white" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="m11 17 2 2a1 1 0 1 0 3-3"/>
                <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/>
                <path d="m21 3 1 11h-2"/>
                <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/>
                <path d="M3 4h8"/>
              </svg>
              <span class="text-xl font-bold text-white">Contribuir</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  `;
};

/**
 * Injects a donation block after the first paragraph following the first image
 * If no image is found, injects after the 3rd paragraph as fallback
 */
export function injectDonationBlock(htmlContent: string): string {
  // Create donation block HTML
  const donationBlockHTML = getDonationBlockHTML();

  // Split content into paragraphs and other elements
  const paragraphRegex = /<p[^>]*>[\s\S]*?<\/p>/g;
  const imageRegex = /<img[^>]*>/g;

  // Find all paragraphs
  const paragraphs = htmlContent.match(paragraphRegex) || [];

  if (paragraphs.length === 0) {
    // No paragraphs found, return original content
    return htmlContent;
  }

  // Check if there are any images before trying the primary strategy
  const hasImages = imageRegex.test(htmlContent);

  if (hasImages) {
    // Primary strategy: Find first image, then insert after first paragraph that follows it
    let imageFound = false;
    let insertionPoint = -1;
    let paragraphBeforeAdIndex = -1;

    // Split content by paragraphs and track positions
    let currentContent = htmlContent;
    let searchIndex = 0;

    for (let i = 0; i < paragraphs.length; i++) {
      const paragraphIndex = currentContent.indexOf(paragraphs[i], searchIndex);

      if (!imageFound) {
        // Check if there's an image before this paragraph
        const contentBeforeParagraph = currentContent.substring(
          0,
          paragraphIndex
        );
        if (imageRegex.test(contentBeforeParagraph)) {
          imageFound = true;
          insertionPoint = paragraphIndex + paragraphs[i].length;
          paragraphBeforeAdIndex = i;
          break;
        }
      }

      searchIndex = paragraphIndex + paragraphs[i].length;
    }

    if (insertionPoint > -1 && paragraphBeforeAdIndex > -1) {
      // Add downward arrow to the paragraph before the donation block
      const paragraphBeforeAd = paragraphs[paragraphBeforeAdIndex];
      const modifiedParagraph = paragraphBeforeAd.replace(
        /<\/p>$/,
        ' <span style="color: var(--color-primary-dark, #1e40af); margin-left: 0.25rem;">↓</span></p>'
      );

      const contentWithArrow = htmlContent.replace(
        paragraphBeforeAd,
        modifiedParagraph
      );

      return (
        contentWithArrow.substring(
          0,
          insertionPoint + (modifiedParagraph.length - paragraphBeforeAd.length)
        ) +
        donationBlockHTML +
        contentWithArrow.substring(
          insertionPoint + (modifiedParagraph.length - paragraphBeforeAd.length)
        )
      );
    }
  }

  // Fallback strategy: Insert after 3rd paragraph (or last paragraph if fewer than 3)
  const fallbackPosition = Math.min(2, paragraphs.length - 1); // 0-indexed, so 2 = 3rd paragraph
  const targetParagraph = paragraphs[fallbackPosition];
  const insertionIndex =
    htmlContent.indexOf(targetParagraph) + targetParagraph.length;

  // Add downward arrow to the paragraph before the donation block (fallback)
  const modifiedParagraph = targetParagraph.replace(
    /<\/p>$/,
    ' <span style="color: var(--color-primary-dark, #1e40af); margin-left: 0.25rem;">↓</span></p>'
  );

  const contentWithArrow = htmlContent.replace(
    targetParagraph,
    modifiedParagraph
  );
  const adjustedInsertionIndex =
    insertionIndex + (modifiedParagraph.length - targetParagraph.length);

  return (
    contentWithArrow.substring(0, adjustedInsertionIndex) +
    donationBlockHTML +
    contentWithArrow.substring(adjustedInsertionIndex)
  );
}
