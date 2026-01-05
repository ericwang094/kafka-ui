package io.kafbat.ui.config.auth;

import java.io.Serial;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.OidcUserInfo;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;

public class RbacOidcUser implements RbacUser, OidcUser, Serializable {

  @Serial
  private static final long serialVersionUID = 1L;

  private final String name;
  private final Set<String> groups;
  private final Set<String> authorityStrings;
  private final Map<String, Object> attributes;
  private final Map<String, Object> claims;
  private final OidcIdToken idToken;
  private final OidcUserInfo userInfo;

  public RbacOidcUser(OidcUser user, Collection<String> groups) {
    this.name = user.getName();
    this.groups = new HashSet<>(groups);
    this.authorityStrings = new HashSet<>();
    for (GrantedAuthority authority : user.getAuthorities()) {
      this.authorityStrings.add(authority.getAuthority());
    }
    this.attributes = new HashMap<>(user.getAttributes());
    this.claims = new HashMap<>(user.getClaims());
    this.idToken = user.getIdToken();
    this.userInfo = user.getUserInfo();
  }

  @Override
  public Map<String, Object> getClaims() {
    return claims;
  }

  @Override
  public OidcUserInfo getUserInfo() {
    return userInfo;
  }

  @Override
  public OidcIdToken getIdToken() {
    return idToken;
  }

  @Override
  public Map<String, Object> getAttributes() {
    return attributes;
  }

  @Override
  public Collection<? extends GrantedAuthority> getAuthorities() {
    Collection<SimpleGrantedAuthority> authorities = new ArrayList<>();
    for (String auth : authorityStrings) {
      authorities.add(new SimpleGrantedAuthority(auth));
    }
    return authorities;
  }

  @Override
  public String getName() {
    return name;
  }

  @Override
  public String name() {
    return name;
  }

  @Override
  public Collection<String> groups() {
    return groups;
  }
}
