import { Story, Category } from '../types';

export const initialStories: Story[] = [
  {
    id: '1',
    title: 'Breaking News: Major Scientific Discovery',
    content: 'Scientists have made a groundbreaking discovery...',
    excerpt: 'Revolutionary findings in quantum physics shake the scientific community',
    imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d',
    author: 'Dr. Jane Smith',
    publishedAt: new Date().toISOString(),
    category: 'science'
  },
  {
    id: '2',
    title: 'Tech Giants Announce New Partnership',
    content: 'Leading technology companies join forces...',
    excerpt: 'Historic collaboration promises to revolutionize the industry',
    imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c',
    author: 'John Tech',
    publishedAt: new Date().toISOString(),
    category: 'technology'
  },
  {
    id: '3',
    title: 'Climate Change Summit Reaches Agreement',
    content: 'World leaders commit to ambitious climate goals...',
    excerpt: 'Historic environmental accord sets new global standards',
    imageUrl: 'https://images.unsplash.com/photo-1569163139599-0f4517e36f51',
    author: 'Emma Green',
    publishedAt: new Date().toISOString(),
    category: 'politics'
  },
  {
    id: '4',
    title: 'Revolutionary AI Breakthrough in Healthcare',
    content: 'New AI system accurately predicts patient outcomes...',
    excerpt: 'Machine learning transforms medical diagnosis',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d',
    author: 'Dr. Alex Chen',
    publishedAt: new Date().toISOString(),
    category: 'health'
  },
  {
    id: '5',
    title: 'Global Markets Hit Record High',
    content: 'Stock markets worldwide reach unprecedented levels...',
    excerpt: 'Investors celebrate as economy shows strong growth',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3',
    author: 'Sarah Finance',
    publishedAt: new Date().toISOString(),
    category: 'business'
  },
  {
    id: '6',
    title: 'Breakthrough in Renewable Energy Storage',
    content: 'New battery technology revolutionizes green energy...',
    excerpt: 'Sustainable power becomes more viable with innovation',
    imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276',
    author: 'Michael Green',
    publishedAt: new Date().toISOString(),
    category: 'technology'
  },
  {
    id: '7',
    title: 'Major Sports League Announces Expansion',
    content: 'New teams to join professional league...',
    excerpt: 'Sports fans celebrate as league grows',
    imageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211',
    author: 'Tom Sports',
    publishedAt: new Date().toISOString(),
    category: 'sports'
  },
  {
    id: '8',
    title: 'Entertainment Industry Embraces Virtual Reality',
    content: 'Movie studios invest heavily in VR technology...',
    excerpt: 'Future of entertainment takes shape',
    imageUrl: 'https://images.unsplash.com/photo-1535016120720-40c646be5580',
    author: 'Lisa Entertainment',
    publishedAt: new Date().toISOString(),
    category: 'entertainment'
  },
  {
    id: '9',
    title: 'Breakthrough in Cancer Research',
    content: 'Scientists discover new treatment method...',
    excerpt: 'Hope rises with innovative therapy approach',
    imageUrl: 'https://images.unsplash.com/photo-1579165466741-7f35e4755660',
    author: 'Dr. Robert Health',
    publishedAt: new Date().toISOString(),
    category: 'health'
  }
];