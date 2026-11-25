import type { CategoryCode } from "@/lib/api/types";

interface Props {
  name: string;
  category: CategoryCode;
  size?: "sm" | "md" | "lg";
}

// 상품 이미지 컬럼이 없으므로 카테고리 색상의 정육 라벨로 대신 표시한다.
export function ProductThumb({ name, category, size = "md" }: Props) {
  return (
    <div className={`thumb thumb-${size} thumb-${category.toLowerCase()}`}>
      <span className="thumb-name display">{name}</span>
    </div>
  );
}
