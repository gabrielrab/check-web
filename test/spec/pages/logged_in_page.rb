require_relative './login_page.rb'

module LoggedInPage
  def logout
    avatar = wait_for_selector(".avatar")
    avatar.click
    logout = element('.user-menu__logout')
    logout.click
    wait_for_selector('#login-container')
    LoginPage.new(config: @config, driver: @driver)
  end

  def logout_and_close
    logout
    close
  end
end
