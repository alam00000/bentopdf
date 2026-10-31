const params = new URLSearchParams(window.location.search);
const outcome = params.get('status') ?? '';
const failed =
  params.get('checkout') === 'failed' ||
  ['failed', 'expired', 'cancelled'].includes(outcome);
const paid = params.has('paid') || params.has('subscription_id');

if (failed || paid) {
  document
    .getElementById(failed ? 'ad-failed' : 'ad-paid')
    ?.removeAttribute('hidden');
}
