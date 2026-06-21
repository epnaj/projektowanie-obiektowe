// @ts-check
const { test, expect } = require('@playwright/test');

// ADDED /register, /login

const PRODUCTS = {
  keyboard: { 
    id: 1,
    name: 'keyboard', 
    price: 320 
  },
  mouse: { 
    id: 2, 
    name: 'mouse', 
    price: 150 
  },
  monitor: { 
    id: 3, 
    name: 'monitor', 
    price: 1290 
  },
  pendrive: { 
    id: 4, 
    name: 'pendrive', 
    price: 240 
  },
};

const USER = {
  username: 'e2e_user',
  email: 'e2e_user@example.com',
  password: 'sup3rsecret',
};

// Navigate within the SPA by clicking the nav link (preserves cart state)
async function navTo(page, route) {
  await page.click(`nav a[href='${route}']`);
}

test('full E2E webshop journey: register -> login -> browse -> cart -> checkout -> account', async ({ page }) => {
  await page.goto('/products');
  await expect(page).toHaveURL(/\/products$/);                                // 1
  await expect(page.locator('h1')).toHaveText('Task 5');                      // 2
  const nav = page.locator('nav');
  await expect(nav).toBeVisible();                                            // 3
  await expect(nav.locator("a[href='/products']")).toBeVisible();             // 4
  await expect(nav.locator("a[href='/cart']")).toBeVisible();                 // 5
  await expect(nav.locator("a[href='/payments']")).toBeVisible();             // 6
  await expect(nav.locator("a[href='/register']")).toBeVisible();             // 7
  await expect(nav.locator("a[href='/login']")).toBeVisible();                // 8

  // Registration - invalid input first, then a successful registration
  await navTo(page, '/register');
  await expect(page).toHaveURL(/\/register$/);                                 // 9
  await expect(page.locator('h2')).toHaveText('Register');                    // 10
  await expect(page.getByTestId('username')).toBeVisible();                   // 11
  await expect(page.getByTestId('email')).toBeVisible();                      // 12
  await expect(page.getByTestId('password')).toBeVisible();                   // 13
  await expect(page.getByTestId('submit')).toBeVisible();                     // 14

  // submit empty form -> server returns field errors, rendered in the list
  await page.getByTestId('submit').click();
  const regErrors = page.getByTestId('errors');
  await expect(regErrors).toBeVisible();                                     // 15
  await expect(regErrors).toContainText('username is required');             // 16
  await expect(regErrors).toContainText('email is required');                // 17
  await expect(regErrors).toContainText('password is required');             // 18
  await expect(page.getByTestId('welcome')).toHaveCount(0);                  // 19

  // invalid email format -> dedicated error, still no registration
  await page.getByTestId('username').fill(USER.username);
  await page.getByTestId('email').fill('not-an-email');
  await page.getByTestId('password').fill(USER.password);
  await page.getByTestId('submit').click();
  await expect(regErrors).toContainText('invalid email format');             // 20
  await expect(page.getByTestId('welcome')).toHaveCount(0);                  // 21

  // valid data -> welcome screen with the username, no error list
  await page.getByTestId('email').fill(USER.email);
  await page.getByTestId('submit').click();
  const welcome = page.getByTestId('welcome');
  await expect(welcome).toBeVisible();                                       // 22
  await expect(welcome).toHaveText(`Welcome, ${USER.username}!`);            // 23
  await expect(welcome).toContainText(USER.username);                        // 24
  await expect(page.getByTestId('errors')).toHaveCount(0);                   // 25

  
  // Login 
  await navTo(page, '/login');
  await expect(page).toHaveURL(/\/login$/);                                  // 26
  await expect(page.locator('h2')).toHaveText('Login');                      // 27
  await expect(page.getByTestId('email')).toBeVisible();                     // 28
  await expect(page.getByTestId('password')).toBeVisible();                  // 29
  await expect(page.getByTestId('submit')).toBeVisible();                    // 30

  // bad login (invalid email format) -> error, no account view
  await page.getByTestId('email').fill('bad-email');
  await page.getByTestId('password').fill(USER.password);
  await page.getByTestId('submit').click();
  await expect(page.getByTestId('errors')).toBeVisible();                         // 31
  await expect(page.getByTestId('errors')).toContainText('invalid email format'); // 32
  await expect(page.getByTestId('account-email')).toHaveCount(0);                 // 33

  // valid login -> account view with the logged-in email + session cookie
  await page.getByTestId('email').fill(USER.email);
  await page.getByTestId('submit').click();
  const accountEmail = page.getByTestId('account-email');
  await expect(accountEmail).toBeVisible();                                  // 34
  await expect(accountEmail).toHaveText(USER.email);                         // 35
  await expect(page.getByTestId('refresh-account')).toBeVisible();           // 36

  // session cookie 'sid' must now exist for the app origin
  const cookies = await page.context().cookies();
  const sid = cookies.find((c) => c.name === 'sid');
  expect(sid).toBeTruthy();                                                  // 37
  expect(sid && sid.value.length).toBeGreaterThan(0);                       // 38
  expect(sid && sid.path).toBe('/');                                        // 39

  // refresh re-reads /api/account using the session cookie -> same email
  await page.getByTestId('refresh-account').click();
  await expect(page.getByTestId('account-email')).toHaveText(USER.email);   // 40

  // Browse products
  await navTo(page, '/products');
  await expect(page).toHaveURL(/\/products$/);                               // 41
  await expect(page.locator('h2')).toHaveText('Products');                  // 42
  const productItems = page.locator('section ul > li');
  await expect(productItems).toHaveCount(4);                                 // 43
  await expect(page.getByText('keyboard')).toBeVisible();                   // 44
  await expect(page.getByText('mouse')).toBeVisible();                      // 45
  await expect(page.getByText('monitor')).toBeVisible();                    // 46
  await expect(page.getByText('pendrive')).toBeVisible();                   // 47
  await expect(page.getByText('320 PLN')).toBeVisible();                    // 48
  await expect(page.getByText('1290 PLN')).toBeVisible();                   // 49
  for (const id of [1, 2, 3, 4]) {
    await expect(page.getByTestId(`add-${id}`)).toBeVisible();              // 50, 51, 52, 53
  }

  // Add to cart
  await page.getByTestId(`add-${PRODUCTS.keyboard.id}`).click();
  await page.getByTestId(`add-${PRODUCTS.monitor.id}`).click();
  await page.getByTestId(`add-${PRODUCTS.mouse.id}`).click();

  // Cart view
  await navTo(page, '/cart');
  await expect(page).toHaveURL(/\/cart$/);                                   // 54
  await expect(page.locator('h2')).toHaveText('Cart');                      // 55
  await expect(page.getByTestId('cart-empty')).toHaveCount(0);              // 56
  await expect(page.getByTestId('cart-count')).toHaveText('3');             // 57
  const cartItems = page.getByTestId('cart-item');
  await expect(cartItems).toHaveCount(3);                                   // 58
  await expect(page.getByTestId('cart-items')).toBeVisible();              // 59
  await expect(page.getByTestId('cart-total')).toHaveText(                  // 60
    String(PRODUCTS.keyboard.price + PRODUCTS.monitor.price + PRODUCTS.mouse.price)
  );
  await expect(page.getByText('keyboard', { exact: false })).toBeVisible(); // 61
  await expect(page.getByText('monitor', { exact: false })).toBeVisible();  // 62
  await expect(page.getByText('mouse', { exact: false })).toBeVisible();    // 63
  await expect(page.getByTestId(`remove-${PRODUCTS.mouse.id}`)).toBeVisible(); // 64

  // remove the mouse -> 2 items left, total recalculated
  await page.getByTestId(`remove-${PRODUCTS.mouse.id}`).click();
  await expect(page.getByTestId('cart-item')).toHaveCount(2);               // 65
  await expect(page.getByTestId('cart-count')).toHaveText('2');             // 66
  await expect(page.getByTestId('cart-total')).toHaveText(                  // 67
    String(PRODUCTS.keyboard.price + PRODUCTS.monitor.price)
  );

  
  // Checkout / payment - single payment, then pay for the whole cart
  await navTo(page, '/payments');
  await expect(page).toHaveURL(/\/payments$/);                             // 68
  await expect(page.locator('h2')).toHaveText('Payments');                 // 69
  await expect(page.getByText('Items in cart: 2')).toBeVisible();          // 70
  await expect(page.getByText('No payments yet.')).toBeVisible();          // 71

  // single direct payment via the select + Pay button (defaults to first product)
  const select = page.locator('#product');
  await expect(select).toBeVisible();                                      // 72
  await select.selectOption(String(PRODUCTS.monitor.id));
  await page.getByRole('button', { name: 'Pay', exact: true }).click();
  await expect(page.getByText('Payment saved:')).toBeVisible();           // 73
  await expect(page.getByText(                                            // 74
    `Payment saved: ${PRODUCTS.monitor.name} (${PRODUCTS.monitor.price} PLN)`
  )).toBeVisible();
  await expect(page.getByText('No payments yet.')).toHaveCount(0);        // 75
  const historyAfterSingle = page.locator('section > ul > li');
  await expect(historyAfterSingle).toHaveCount(1);                        // 76 (one payment in history)

  // pay for the entire cart (keyboard + monitor) -> clears the cart
  const payCartBtn = page.getByRole('button', { name: 'Pay for entire cart' });
  await expect(payCartBtn).toBeEnabled();                                 // 77
  await payCartBtn.click();
  await expect(page.getByText('Paid for 2 items')).toBeVisible();         // 78
  await expect(page.getByText(                                            // 7
    `(${PRODUCTS.keyboard.price + PRODUCTS.monitor.price} PLN)`
  )).toBeVisible();
  await expect(page.getByText('Items in cart: 0')).toBeVisible();         // 80 (cart emptied)
  await expect(payCartBtn).toBeDisabled();                                // 81 (nothing left to pay)
  // history now holds the single payment + the two cart payments = 3
  await expect(page.locator('section > ul > li')).toHaveCount(3);         // 82


  // Cart empty
  await navTo(page, '/cart');
  await expect(page).toHaveURL(/\/cart$/);                                 // 83
  await expect(page.getByTestId('cart-empty')).toBeVisible();             // 84
  await expect(page.getByTestId('cart-empty')).toHaveText('Cart is empty.'); // 85
  await expect(page.getByTestId('cart-count')).toHaveText('0');           // 86
  await expect(page.getByTestId('cart-item')).toHaveCount(0);             // 87

  await navTo(page, '/login');
  await expect(page).toHaveURL(/\/login$/);                                // 88
  await page.getByTestId('email').fill(USER.email);
  await page.getByTestId('password').fill(USER.password);
  await page.getByTestId('submit').click();
  await expect(page.getByTestId('account-email')).toBeVisible();          // 89
  await expect(page.getByTestId('account-email')).toHaveText(USER.email); // 90

  // session cookie is still present at the end of the journey
  const finalCookies = await page.context().cookies();
  expect(finalCookies.some((c) => c.name === 'sid')).toBeTruthy();        // 91
});
