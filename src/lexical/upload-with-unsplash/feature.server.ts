import { createServerFeature, createNode, UploadServerNode } from '@payloadcms/richtext-lexical'

export const UploadWithUnsplashFeature = createServerFeature({
  feature: () => {
    return {
      ClientFeature: './src/lexical/upload-with-unsplash/feature.client#UploadWithUnsplashFeatureClient',
      nodes: [
        createNode({
          node: UploadServerNode,
        }),
      ],
    }
  },
  key: 'uploadWithUnsplash',
})
