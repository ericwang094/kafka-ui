package io.kafbat.ui.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.session.data.redis.config.annotation.web.server.EnableRedisWebSession;

@Configuration
@ConditionalOnProperty(name = "spring.session.store-type", havingValue = "redis")
@EnableRedisWebSession
public class RedisSessionConfig {
}
