export type ProductDetails = {
  sourceUrl: string;
  retailer: string;
  productName: string;
  description: string;
  imageUrl: string;
};

export type Specification = {
  id: string;
  projectName: string;
  product: ProductDetails;
  utmLink: string;
  isFavourite: boolean;
  createdAt: string;
};
