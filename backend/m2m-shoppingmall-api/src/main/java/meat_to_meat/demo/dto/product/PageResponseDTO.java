package meat_to_meat.demo.dto.product;

import org.springframework.data.domain.Page;

import java.util.List;
import java.util.function.Function;

// 프론트의 Page<T> 형식: page 는 0부터 시작
public record PageResponseDTO<T>(List<T> content, int page, int size, long totalElements, int totalPages) {
    public static <E, T> PageResponseDTO<T> of(Page<E> page, Function<E, T> mapper) {
        return new PageResponseDTO<>(page.getContent().stream().map(mapper).toList(),
                page.getNumber(), page.getSize(), page.getTotalElements(), Math.max(1, page.getTotalPages()));
    }
}
