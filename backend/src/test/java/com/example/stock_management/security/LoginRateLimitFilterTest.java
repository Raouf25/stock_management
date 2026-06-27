package com.example.stock_management.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.assertj.core.api.Assertions.assertThat;

class LoginRateLimitFilterTest {

    private LoginRateLimitFilter filter;

    @BeforeEach
    void setUp() {
        filter = new LoginRateLimitFilter();
    }

    @Test
    void allowsRequestsUnderLimit() throws Exception {
        for (int i = 0; i < 10; i++) {
            MockHttpServletResponse response = fireLogin("1.2.3.4");
            assertThat(response.getStatus()).isEqualTo(200);
        }
    }

    @Test
    void blocks11thRequestFromSameIp() throws Exception {
        for (int i = 0; i < 10; i++) {
            fireLogin("5.6.7.8");
        }
        MockHttpServletResponse response = fireLogin("5.6.7.8");
        assertThat(response.getStatus()).isEqualTo(429);
        assertThat(response.getContentAsString()).contains("Too Many Requests");
    }

    @Test
    void differentIpsAreTrackedIndependently() throws Exception {
        for (int i = 0; i < 10; i++) {
            fireLogin("10.0.0.1");
        }
        // Different IP should still be allowed
        MockHttpServletResponse response = fireLogin("10.0.0.2");
        assertThat(response.getStatus()).isEqualTo(200);
    }

    @Test
    void nonAuthPathIsNotRateLimited() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/products");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilterInternal(request, response, chain);

        // Filter should not apply — chain continues, no 429
        assertThat(response.getStatus()).isEqualTo(200);
    }

    @Test
    void forgotPasswordPathIsRateLimited() throws Exception {
        for (int i = 0; i < 10; i++) {
            fireForgotPassword("9.9.9.9");
        }
        MockHttpServletResponse response = fireForgotPassword("9.9.9.9");
        assertThat(response.getStatus()).isEqualTo(429);
    }

    @Test
    void xForwardedForHeaderIsRespected() throws Exception {
        for (int i = 0; i < 10; i++) {
            fireLoginWithHeader("192.168.1.1", "203.0.113.5");
        }
        // 11th from same forwarded IP should be blocked
        MockHttpServletResponse response = fireLoginWithHeader("192.168.1.1", "203.0.113.5");
        assertThat(response.getStatus()).isEqualTo(429);
    }

    private MockHttpServletResponse fireLogin(String remoteAddr) throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/auth/login");
        request.setRemoteAddr(remoteAddr);
        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilterInternal(request, response, new MockFilterChain());
        return response;
    }

    private MockHttpServletResponse fireForgotPassword(String remoteAddr) throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/auth/forgot-password");
        request.setRemoteAddr(remoteAddr);
        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilterInternal(request, response, new MockFilterChain());
        return response;
    }

    private MockHttpServletResponse fireLoginWithHeader(String remoteAddr, String forwardedFor) throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/auth/login");
        request.setRemoteAddr(remoteAddr);
        request.addHeader("X-Forwarded-For", forwardedFor);
        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilterInternal(request, response, new MockFilterChain());
        return response;
    }
}
