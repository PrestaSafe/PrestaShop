// Import utils
import helper from '@utils/helpers';
import testContext from '@utils/testContext';

// Import login steps
import loginCommon from '@commonTests/BO/loginBO';

// Import pages
// Import BO pages
import dashboardPage from '@pages/BO/dashboard';
import customerSettingsPage from '@pages/BO/shopParameters/customerSettings';
import CustomerSettingsOptions from '@pages/BO/shopParameters/customerSettings/options';

// Import FO pages
import {homePage as foHomePage} from '@pages/FO/home';
import {loginPage as loginFOPage} from '@pages/FO/login';
import {createAccountPage as foCreateAccountPage} from '@pages/FO/myAccount/add';

import {expect} from 'chai';
import type {BrowserContext, Page} from 'playwright';

const baseContext: string = 'functional_BO_shopParameters_customerSettings_customers_askForBirthDate';

/*
Enable ask for birthdate
Go to FO > create account page and check that birthdate input is visible
Disable ask for birthdate
Go to FO > create account page and check that birthdate input is not visible
 */
describe('BO - Shop Parameters - Customer Settings : Enable/Disable ask for birth date', async () => {
  let browserContext: BrowserContext;
  let page: Page;

  // before and after functions
  before(async function () {
    browserContext = await helper.createBrowserContext(this.browser);
    page = await helper.newTab(browserContext);
  });

  after(async () => {
    await helper.closeBrowserContext(browserContext);
  });

  it('should login in BO', async function () {
    await loginCommon.loginBO(this, page);
  });

  it('should go to \'Shop parameters > Customer Settings\' page', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'goToCustomerSettingsPage', baseContext);

    await dashboardPage.goToSubMenu(
      page,
      dashboardPage.shopParametersParentLink,
      dashboardPage.customerSettingsLink,
    );
    await customerSettingsPage.closeSfToolBar(page);

    const pageTitle = await customerSettingsPage.getPageTitle(page);
    await expect(pageTitle).to.contains(customerSettingsPage.pageTitle);
  });

  const tests = [
    {args: {action: 'disable', enable: false}},
    {args: {action: 'enable', enable: true}},
  ];

  tests.forEach((test, index: number) => {
    it(`should ${test.args.action} ask for birth date`, async function () {
      await testContext.addContextItem(this, 'testIdentifier', `${test.args.action}AskForBirthDate`, baseContext);

      const result = await customerSettingsPage.setOptionStatus(
        page,
        CustomerSettingsOptions.OPTION_BIRTH_DATE,
        test.args.enable,
      );

      await expect(result).to.contains(customerSettingsPage.successfulUpdateMessage);
    });

    it('should go to customer account in FO and check birth day input', async function () {
      await testContext.addContextItem(this, 'testIdentifier', `checkIsBirthDate${index}`, baseContext);

      // Go to FO
      page = await customerSettingsPage.viewMyShop(page);

      // Change language in FO
      await foHomePage.changeLanguage(page, 'en');

      // Go to create account page
      await foHomePage.goToLoginPage(page);
      await loginFOPage.goToCreateAccountPage(page);

      // Check birthday
      const isBirthDateInputVisible = await foCreateAccountPage.isBirthDateVisible(page);
      await expect(isBirthDateInputVisible).to.be.equal(test.args.enable);
    });

    it('should go back to BO', async function () {
      await testContext.addContextItem(this, 'testIdentifier', `goBackToBO${index}`, baseContext);

      // Go back to BO
      page = await foCreateAccountPage.closePage(browserContext, page, 0);

      const pageTitle = await customerSettingsPage.getPageTitle(page);
      await expect(pageTitle).to.contains(customerSettingsPage.pageTitle);
    });
  });
});
