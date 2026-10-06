package com.gogiseogogi.spb.entity.user;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Getter
@Table(name = "users")
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    @Column(unique = true)
    @NotBlank
    private String userPw;


    @Column(nullable = false)
    @NotBlank
    private String name;

    @Column(unique = true)
    private LocalDate birthday;

    @Column(unique = true, nullable = false)
    @NotBlank
    private String loginId;

    @Column(unique = true, nullable = false)
    @NotBlank
    private String email;

    @Column(unique = true, nullable = false)
    @NotBlank
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Sex sex;

}

