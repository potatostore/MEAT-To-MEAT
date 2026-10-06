import Link from "next/link";
import { discountRate, effectivePrice, won } from "@/lib/format";
import type { Product } from "@/lib/api/types";
import { ProductThumb } from "./ProductThumb";

export function ProductCard({ product }: { product: Product }) {
  const rate = discountRate(product);
  return (
    <Link href={`/products/${product.id}`} className="product-card">
      <ProductThumb name={product.name} category={product.category} grade={product.grade} />
      <div className="product-body">
        <div className="kind">
          {product.categoryName} · {product.origin}
        </div>
        <h3 className="display">{product.name}</h3>
        <div className="desc">{product.summary}</div>
        <div className="price">
          {rate > 0 && <em className="rate">{rate}%</em>}
          {won(effectivePrice(product))} <small>/ {product.unit}</small>
          {rate > 0 && <s className="origin-price">{won(product.price)}</s>}
        </div>
        {product.stock === 0 && <div className="soldout">일시 품절</div>}
      </div>
    </Link>
  );
}
