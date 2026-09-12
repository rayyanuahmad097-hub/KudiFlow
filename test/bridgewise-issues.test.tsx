/**
 * KudiFlow — Tests for Issues #144, #145, #146, #147
 *
 * Run with: vitest  (or jest with ts-jest)
 *
 * Dependencies: @testing-library/react, @testing-library/user-event, vitest
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ── #144 ─────────────────────────────────────────────────────────────────────

describe("#144 QuoteExpirationCountdown", async () => {
  const { QuoteExpirationCountdown } = await import("./QuoteExpirationCountdown");
  const { useQuoteExpiration } = await import("./useQuoteExpiration");

  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  function future(s: number) {
    return new Date(Date.now() + s * 1000).toISOString();
  }

  it("renders the countdown in MM:SS format", () => {
    render(<QuoteExpirationCountdown expiresAt={future(90)} />);
    expect(screen.getByRole("timer")).toBeTruthy();
    expect(screen.getByText("01:30")).toBeTruthy();
  });

  it("decrements every second", async () => {
    render(<QuoteExpirationCountdown expiresAt={future(5)} />);
    expect(screen.getByText("00:05")).toBeTruthy();
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByText("00:04")).toBeTruthy();
  });

  it("shows 'expired' state when time runs out", async () => {
    render(<QuoteExpirationCountdown expiresAt={future(1)} />);
    act(() => vi.advanceTimersByTime(2000));
    expect(screen.getByText("00:00")).toBeTruthy();
    expect(screen.getByText(/expired/i)).toBeTruthy();
  });

  it("calls onExpire callback", async () => {
    const onExpire = vi.fn();
    render(
      <QuoteExpirationCountdown expiresAt={future(1)} onExpire={onExpire} />
    );
    act(() => vi.advanceTimersByTime(2000));
    expect(onExpire).toHaveBeenCalledOnce();
  });

  it("shows refresh button on expired state when onRefresh provided", () => {
    const onRefresh = vi.fn();
    render(
      <QuoteExpirationCountdown
        expiresAt={future(0)}
        onRefresh={onRefresh}
      />
    );
    const btn = screen.getByRole("button", { name: /refresh/i });
    expect(btn).toBeTruthy();
    btn.click();
    expect(onRefresh).toHaveBeenCalledOnce();
  });

  it("useQuoteExpiration hook returns correct flags", () => {
    let result: ReturnType<typeof useQuoteExpiration>;
    function Wrapper() {
      result = useQuoteExpiration({ expiresAt: future(8) });
      return null;
    }
    render(<Wrapper />);
    expect(result!.isCritical).toBe(true);
    expect(result!.isWarning).toBe(true);
    expect(result!.isExpired).toBe(false);
  });
});

// ── #145 ─────────────────────────────────────────────────────────────────────

describe("#145 ChainIcon & chainIcons", async () => {
  const { getChainMeta, getAllSupportedChains, CHAIN_MAP } = await import("./chainIcons");
  const { ChainIcon } = await import("./ChainIcon");

  it("returns correct meta for Ethereum (1)", () => {
    const meta = getChainMeta(1);
    expect(meta.name).toBe("Ethereum");
    expect(meta.symbol).toBe("ETH");
    expect(meta.color).toBe("#627EEA");
  });

  it("returns correct meta for Polygon (137)", () => {
    const meta = getChainMeta(137);
    expect(meta.name).toBe("Polygon");
    expect(meta.symbol).toBe("MATIC");
  });

  it("returns fallback meta for unknown chain", () => {
    const meta = getChainMeta(999999);
    expect(meta.name).toMatch(/chain 999999/i);
    expect(meta.symbol).toBe("???");
    expect(meta.svg).toBeTruthy();
  });

  it("getAllSupportedChains returns all registered chains", () => {
    const chains = getAllSupportedChains();
    expect(chains.length).toBe(Object.keys(CHAIN_MAP).length);
    expect(chains.every((c) => c.svg && c.name && c.color)).toBe(true);
  });

  it("ChainIcon renders an img with aria-label", () => {
    render(<ChainIcon chainId={1} size={32} />);
    expect(screen.getByRole("img", { name: "Ethereum" })).toBeTruthy();
  });

  it("ChainIcon renders name when showName=true", () => {
    render(<ChainIcon chainId={56} showName />);
    expect(screen.getByText("BNB Chain")).toBeTruthy();
  });

  it("ChainIcon renders unknown chain without crashing", () => {
    render(<ChainIcon chainId={0} />);
    expect(screen.getByRole("img")).toBeTruthy();
  });
});

// ── #146 ─────────────────────────────────────────────────────────────────────

describe("#146 TokenSearchAutocomplete", async () => {
  const { TokenSearchAutocomplete } = await import("./TokenSearchAutocomplete");
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  const TOKENS = [
    { address: "0xaaa", symbol: "USDC", name: "USD Coin", chainId: 1, decimals: 6 },
    { address: "0xbbb", symbol: "WETH", name: "Wrapped Ether", chainId: 1, decimals: 18 },
    { address: "0xccc", symbol: "DAI",  name: "Dai Stablecoin", chainId: 1, decimals: 18 },
    { address: "0xddd", symbol: "USDT", name: "Tether USD", chainId: 1, decimals: 6 },
  ];

  it("shows suggestions on focus", async () => {
    render(<TokenSearchAutocomplete tokens={TOKENS} />);
    const input = screen.getByRole("combobox");
    await user.click(input);
    act(() => vi.advanceTimersByTime(300));
    expect(screen.getByRole("listbox")).toBeTruthy();
  });

  it("filters by symbol", async () => {
    render(<TokenSearchAutocomplete tokens={TOKENS} />);
    const input = screen.getByRole("combobox");
    await user.type(input, "USDC");
    act(() => vi.advanceTimersByTime(300));
    expect(screen.getByText("USDC")).toBeTruthy();
    expect(screen.queryByText("WETH")).toBeNull();
  });

  it("calls onChange with selected token", async () => {
    const onChange = vi.fn();
    render(<TokenSearchAutocomplete tokens={TOKENS} onChange={onChange} />);
    const input = screen.getByRole("combobox");
    await user.click(input);
    act(() => vi.advanceTimersByTime(300));
    const option = screen.getByText("DAI");
    await user.click(option);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ symbol: "DAI" })
    );
  });

  it("supports keyboard navigation", async () => {
    render(<TokenSearchAutocomplete tokens={TOKENS} />);
    const input = screen.getByRole("combobox");
    await user.click(input);
    act(() => vi.advanceTimersByTime(300));
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(input.getAttribute("aria-activedescendant")).toBe("bw-token-item-1");
  });

  it("shows 'No tokens found' for unmatched query", async () => {
    render(<TokenSearchAutocomplete tokens={TOKENS} />);
    const input = screen.getByRole("combobox");
    await user.type(input, "XYZNOTEXIST");
    act(() => vi.advanceTimersByTime(300));
    expect(screen.getByText(/no tokens found/i)).toBeTruthy();
  });

  it("closes on Escape", async () => {
    render(<TokenSearchAutocomplete tokens={TOKENS} />);
    const input = screen.getByRole("combobox");
    await user.click(input);
    act(() => vi.advanceTimersByTime(300));
    expect(screen.getByRole("listbox")).toBeTruthy();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).toBeNull();
  });
});

// ── #147 ─────────────────────────────────────────────────────────────────────

describe("#147 CopyTransactionDetails", async () => {
  const { CopyButton, CopyTransactionDetails } = await import("./CopyTransactionDetails");

  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  const DETAILS = [
    { label: "TX Hash", value: "0x" + "a".repeat(64) },
    { label: "From",    value: "0x" + "b".repeat(40) },
    { label: "Amount",  value: "1.5 ETH" },
  ];

  it("renders all detail rows", () => {
    render(<CopyTransactionDetails details={DETAILS} />);
    expect(screen.getByText("TX Hash")).toBeTruthy();
    expect(screen.getByText("From")).toBeTruthy();
    expect(screen.getByText("Amount")).toBeTruthy();
  });

  it("truncates long hash/address values", () => {
    render(<CopyTransactionDetails details={DETAILS} />);
    const hashCell = screen.getByTitle("0x" + "a".repeat(64));
    expect(hashCell.textContent).toMatch(/…/);
  });

  it("CopyButton copies text to clipboard", async () => {
    const user = userEvent.setup();
    render(<CopyButton text="hello world" label="Copy" variant="full" />);
    const btn = screen.getByRole("button");
    await user.click(btn);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("hello world");
  });

  it("CopyButton shows 'Copied!' after click", async () => {
    const user = userEvent.setup();
    render(<CopyButton text="hello" label="Copy" successLabel="Copied!" variant="full" />);
    await user.click(screen.getByRole("button"));
    await waitFor(() => expect(screen.getByText("Copied!")).toBeTruthy());
  });

  it("shows 'Copy all' button when multiple details present", () => {
    render(<CopyTransactionDetails details={DETAILS} title="TX Details" />);
    expect(screen.getByRole("button", { name: /copy all/i })).toBeTruthy();
  });

  it("'Copy all' copies all fields formatted", async () => {
    const user = userEvent.setup();
    render(<CopyTransactionDetails details={DETAILS} title="TX Details" />);
    const btn = screen.getByRole("button", { name: /copy all/i });
    await user.click(btn);
    const written = (navigator.clipboard.writeText as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(written).toContain("TX Hash:");
    expect(written).toContain("Amount: 1.5 ETH");
  });
});
