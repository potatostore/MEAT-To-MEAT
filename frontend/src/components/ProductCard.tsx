import Link from "next/link";
import { won } from "@/lib/format";
import type { Product } from "@/lib/api/types";
import { ProductThumb } from "./ProductThumb";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.id}`} className="product-card">
      <ProductThumb name={product.name} category={product.category} />
      <div className="product-body">
        <div className="kind">{product.categoryName}</div>
        <h3 className="display">{product.name}</h3>
        <div className="desc">{product.description}</div>
        <div className="price">{won(product.price)}</div>
        {product.stock === 0 && <div className="soldout">일시 품절</div>}
      </div>
    </Link>
  );
}
