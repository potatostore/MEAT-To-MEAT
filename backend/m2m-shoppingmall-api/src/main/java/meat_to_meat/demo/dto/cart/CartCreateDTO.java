package meat_to_meat.demo.dto.cart;

/**
 * 우선 생성할 때, CartCreateDTO는 필요가 없으나, 예시로 보여주기 위해 만들어 놓음
 * user생성요청이 들어오면 user에 매핑되는 cart를 자동으로 만들고, 연결해줘야됨.
 * 따라서 UserCreateDTO처럼 생성 dto가 들어오게 될 경우, 이에 맞춰서 entity 객체 생성 및 저장이 발생함.
 *
 * 이때 null체크를 service의 첫번째처럼 값비교로도 하지만, 더 좋은 방법은 @Valid를 통해 컬럼에 걸어놓은 제한을 확인하는 방식임.
 * 걸어놓은 nullable, min, notblank같은 어노테이션들이 다 @Valid 어노테이션으로 체크가 가능함.
 */

public class CartCreateDTO {
    // columns
}
