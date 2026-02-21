package com.example.backend.dto;

import org.springframework.beans.BeanUtils;

import java.util.List;
import java.util.stream.Collectors;

public class DTOConverter {

    public static <S, T> T convertToDto(S source, Class<T> targetClass) {
        if (source == null) return null;
        try {
            T target = targetClass.getDeclaredConstructor().newInstance();
            BeanUtils.copyProperties(source, target);
            return target;
        } catch (Exception e) {
            throw new RuntimeException("Error converting to DTO", e);
        }
    }

    public static <S, T> T convertToEntity(S source, Class<T> targetClass) {
        if (source == null) return null;
        try {
            T target = targetClass.getDeclaredConstructor().newInstance();
            BeanUtils.copyProperties(source, target);
            return target;
        } catch (Exception e) {
            throw new RuntimeException("Error converting to Entity", e);
        }
    }

    public static <S, T> List<T> convertList(List<S> sourceList, Class<T> targetClass) {
        if (sourceList == null) return null;
        return sourceList.stream()
                .map(source -> convertToDto(source, targetClass))
                .collect(Collectors.toList());
    }
}
