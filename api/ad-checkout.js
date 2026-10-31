const MODES = {
  live: {
    api: 'https://live.dodopayments.com',
    products: new Map([
      ['top', 'pdt_0Nqv9McKI1iCBXb7z4DB7'],
      ['second', 'pdt_0Nqv9OYDLwWZsu1hzpZ0c'],
    ]),
  },
  test: {
    api: 'https://test.dodopayments.com',
    products: new Map([
      ['top', 'pdt_0Nqt0672sYJEtrkIb2K6m'],
      ['second', 'pdt_0Nqt069LgdQFPo1tFS1yF'],
    ]),
  },
};

const FIELDS = [
  {
    key: 'ad_name',
    label: 'Name on the ad',
    field_type: 'text',
    placeholder: 'Acme Invoices',
    required: true,
  },
  {
    key: 'ad_link',
    label: 'Link',
    field_type: 'url',
    placeholder: 'https://example.com',
    required: true,
  },
  {
    key: 'ad_logo',
    label: 'Logo link (square SVG or PNG)',
    field_type: 'url',
    placeholder: 'https://example.com/logo.svg',
    required: true,
  },
];

function redirect(location) {
  return new Response(null, {
    status: 303,
    headers: { Location: location, 'Cache-Control': 'no-store' },
  });
}

async function createCheckout(key, api, productId, page) {
  const response = await fetch(`${api}/checkouts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      product_cart: [{ product_id: productId, quantity: 1 }],
      custom_fields: FIELDS,
      return_url: `${page}?paid=1`,
      cancel_url: `${page}#pricing`,
    }),
    signal: AbortSignal.timeout(10000),
  });
  const body = await response.text();
  if (!response.ok) {
    throw new Error(`Dodo returned ${response.status}: ${body}`);
  }
  const { checkout_url } = JSON.parse(body);
  if (
    typeof checkout_url !== 'string' ||
    !checkout_url.startsWith('https://')
  ) {
    throw new Error('Dodo returned no checkout URL');
  }
  return checkout_url;
}

export async function GET(request) {
  const url = new URL(request.url);
  const page = `${url.origin}/advertise`;
  const key = process.env.DODO_PAYMENTS_API_KEY ?? '';
  const mode = key.startsWith('dodo_live_') ? MODES.live : MODES.test;
  const productId = mode.products.get(url.searchParams.get('row'));
  if (!productId) return redirect(`${page}#pricing`);

  try {
    return redirect(await createCheckout(key, mode.api, productId, page));
  } catch (error) {
    console.error(error);
    return redirect(`${page}?checkout=failed`);
  }
}
