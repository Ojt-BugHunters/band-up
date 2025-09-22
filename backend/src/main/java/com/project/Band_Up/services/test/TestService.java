package com.project.Band_Up.services.test;

import com.project.Band_Up.dtos.test.TestCreateRequest;
import com.project.Band_Up.dtos.test.TestUpdateRequest;
import com.project.Band_Up.dtos.test.TestResponse;

import java.util.List;
import java.util.UUID;

public interface TestService {

    //  Tạo mới Test
    TestResponse createTest(TestCreateRequest request);

    //  Lấy tất cả Test
    List<TestResponse> getAllTests();

    //  Lấy tất cả Test theo ngày tạo giảm dần
    List<TestResponse> getAllTestsSortedByCreateAt();

    //  Lấy tất cả Test theo skillName
    List<TestResponse> getTestsBySkillName(String skillName);

    //  Tìm kiếm Test theo title (search)
    List<TestResponse> searchTestsByTitle(String keyword);

    //  Cập nhật Test
    TestResponse updateTest(TestUpdateRequest request);

    //  Xóa Test
    void deleteTest(UUID id);
}
