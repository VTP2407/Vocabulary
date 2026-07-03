package com.vtp.vocabulary.exception;

import lombok.Getter;

@Getter
public enum ErrorCode {
    FILE_NOT_EXIST("404","file not exist"),
    INVALID_PASSWORD("405","password is incorrect"),
    USER_NOT_EXIST("404","user not exist"),
    USER_INFO_NOT_EXIST("404","user info not exist"),
    USERNAME_OR_PASSWORD_INCORRECT("401","username or password incorrect"),
    USERNAME_EXISTED("401","username existed"),
    INTERNAL_ERROR("999","error unknow"),
    MUST_FILL_ALL("402","You must fill all row"),
    MUST_SAME_2_PASSWORD("403","Password and rePassword must be same"),
    EMAIL_NOT_FOUND("404", "Email not found"),
    EMAIL_WAS_USED("404", "Email was used by other people"),
    INVALID_GOOGLE_TOKEN("400","invalid google token")
    ;
    private final String code;
    private final String message;

    ErrorCode(String code, String message){
        this.code = code;
        this.message = message;
    }
}
