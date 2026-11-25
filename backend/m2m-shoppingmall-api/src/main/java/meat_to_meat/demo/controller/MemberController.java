package meat_to_meat.demo.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import meat_to_meat.demo.dto.member.ChangePasswordRequestDTO;
import meat_to_meat.demo.dto.member.MemberResponseDTO;
import meat_to_meat.demo.dto.member.UpdateMemberRequestDTO;
import meat_to_meat.demo.global.config.UrlNames;
import meat_to_meat.demo.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(UrlNames.memberBase)
@RequiredArgsConstructor
public class MemberController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<MemberResponseDTO> getMe(@AuthenticationPrincipal Long userId) {
        return ResponseEntity.ok(userService.getMe(userId));
    }

    @PatchMapping
    public ResponseEntity<MemberResponseDTO> updateMe(@AuthenticationPrincipal Long userId,
                                                      @Valid @RequestBody UpdateMemberRequestDTO request) {
        return ResponseEntity.ok(userService.updateMe(userId, request));
    }

    @PatchMapping(UrlNames.password)
    public ResponseEntity<Void> changePassword(@AuthenticationPrincipal Long userId,
                                               @Valid @RequestBody ChangePasswordRequestDTO request) {
        userService.changePassword(userId, request);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> withdraw(@AuthenticationPrincipal Long userId) {
        userService.withdraw(userId);
        return ResponseEntity.noContent().build();
    }
}
