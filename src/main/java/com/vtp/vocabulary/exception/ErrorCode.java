package com.vtp.vocabulary.exception;

import lombok.Getter;

@Getter
public enum ErrorCode {
    USER_NOT_EXIST("404","user not exist"),
    USERNAME_OR_PASSWORD_INCORRECT("401","username or password incorrect"),
    INTERNAL_ERROR("999","error unknow"),
    MUST_FILL_ALL("402","You must fill all row"),
    MUST_SAME_2_PASSWORD("403","Password and rePassword must be same")
    ;
    private final String code;
    private final String message;

    ErrorCode(String code, String message){
        this.code = code;
        this.message = message;
    }
}
