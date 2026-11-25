package meat_to_meat.demo.entity.product;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

// product.product_category 컬럼에 저장되는 값 (VARCHAR(20))
@Getter
@RequiredArgsConstructor
public enum ProductCategory {
    HANWOO("한우", "1++ 등급 구이용, 진공 개별 포장"),
    PORK("돼지고기", "국내산 냉장, 두께 선택 가능"),
    CHICKEN("닭고기", "손질 완료, 소분 냉동 포장"),
    IMPORTED("수입육", "그릴·스테이크용 두께 절단");

    private final String displayName;
    private final String description;
}
