import type { CategoryCode } from "@/lib/api/types";

interface Props {
  name: string;
  category: CategoryCode;
  grade?: string | null;
  imageUrl?: string | null;
  size?: "sm" | "md" | "lg";
}

// 상품 이미지가 아직 없으므로 카테고리 색상의 정육 라벨로 대신 표시한다.
export function ProductThumb({ name, category, grade, imageUrl, size = "md" }: Props) {
  return (
    <div className={`thumb thumb-${size} thumb-${category.toLowerCase()}`}>
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={name} />
      ) : (
        <>
          {grade && <span className="thumb-grade">{grade}</span>}
          <span className="thumb-name display">{name}</span>
        </>
      )}
    </div>
  );
}
