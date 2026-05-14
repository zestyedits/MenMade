-- MenMade — admin / refund support
-- Adds 'refunded' to the subscriptions.status check constraint so the
-- refund endpoint can mark a refunded subscription distinctly from a
-- normal cancel. Per locked pricing memory: a refunded Founder's Pass
-- DOES NOT release the seat — `founder_seats` is intentionally untouched.

alter table public.subscriptions
  drop constraint if exists subscriptions_status_check;

alter table public.subscriptions
  add constraint subscriptions_status_check check (status in (
    'none','active','trialing','past_due','canceled',
    'incomplete','incomplete_expired','unpaid','paused','refunded'
  ));
