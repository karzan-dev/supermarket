<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\CashRegisterAccount;
use App\Models\CashRegisterShift;
use App\Models\CashRegisterTransaction;
use Illuminate\Validation\ValidationException;

class CashRegisterLedger
{
    public function record(
        string $type,
        string $direction,
        string|int|float $amount,
        int $userId,
        string $reason,
        ?string $notes = null,
        ?string $sourceType = null,
        ?int $sourceId = null,
        ?string $idempotencyKey = null,
        ?int $shiftId = null,
    ): CashRegisterTransaction {
        $amountCents = $this->toCents($amount);
        if ($amountCents < 0 || ! in_array($direction, ['IN', 'OUT'], true)) {
            throw ValidationException::withMessages(['amount' => 'The cash amount or direction is invalid.']);
        }

        if ($idempotencyKey !== null) {
            $existing = $this->idempotentTransaction($idempotencyKey, $type, $direction, $amountCents, $userId, $reason, $notes);
            if ($existing) {
                return $existing;
            }
        }

        $account = CashRegisterAccount::query()->lockForUpdate()->findOrFail(1);
        if ($idempotencyKey !== null) {
            $existing = $this->idempotentTransaction($idempotencyKey, $type, $direction, $amountCents, $userId, $reason, $notes);
            if ($existing) {
                return $existing;
            }
        }

        $shift = $shiftId
            ? CashRegisterShift::query()->lockForUpdate()->findOrFail($shiftId)
            : CashRegisterShift::query()->whereNotNull('active_slot')->lockForUpdate()->first();

        if (! $shift || $shift->closed_at) {
            throw ValidationException::withMessages([
                'shift' => 'Open a cash-register shift before recording cash movements.',
            ]);
        }

        if ($sourceType !== null && $sourceId !== null) {
            $existing = CashRegisterTransaction::query()
                ->where('source_type', $sourceType)
                ->where('source_id', $sourceId)
                ->first();
            if ($existing) {
                return $existing;
            }
        }

        $beforeCents = $this->toCents((string) $account->balance);
        $afterCents = $direction === 'IN' ? $beforeCents + $amountCents : $beforeCents - $amountCents;
        if ($afterCents < 0) {
            throw ValidationException::withMessages([
                'amount' => 'The cash register does not have enough cash for this transaction.',
            ]);
        }

        $account->update(['balance' => $this->fromCents($afterCents)]);
        $transaction = CashRegisterTransaction::create([
            'shift_id' => $shift->id,
            'type' => $type,
            'direction' => $direction,
            'amount' => $this->fromCents($amountCents),
            'balance_before' => $this->fromCents($beforeCents),
            'balance_after' => $this->fromCents($afterCents),
            'reason' => $reason,
            'notes' => $notes,
            'source_type' => $sourceType,
            'source_id' => $sourceId,
            'idempotency_key' => $idempotencyKey,
            'user_id' => $userId,
            'created_at' => now(),
        ]);
        $transaction->update([
            'transaction_number' => 'CSH-'.now()->format('Ymd').'-'.str_pad((string) $transaction->id, 8, '0', STR_PAD_LEFT),
        ]);

        ActivityLog::log(
            'CASH_'.$type,
            'CASH_REGISTER_TRANSACTION',
            $transaction->id,
            "{$reason} ({$transaction->amount})",
            $userId,
        );

        return $transaction->fresh();
    }

    public function toCents(string|int|float $amount): int
    {
        $value = is_float($amount) ? number_format($amount, 2, '.', '') : trim((string) $amount);
        if (! preg_match('/^(-?)(\d+)(?:\.(\d{1,2}))?$/', $value, $parts)) {
            throw ValidationException::withMessages(['amount' => 'Amounts must use no more than two decimal places.']);
        }

        $cents = ((int) $parts[2] * 100) + (int) str_pad($parts[3] ?? '', 2, '0');

        return ($parts[1] ?? '') === '-' ? -$cents : $cents;
    }

    private function fromCents(int $cents): string
    {
        return ($cents < 0 ? '-' : '').intdiv(abs($cents), 100).'.'.str_pad((string) (abs($cents) % 100), 2, '0', STR_PAD_LEFT);
    }

    private function idempotentTransaction(
        string $key,
        string $type,
        string $direction,
        int $amountCents,
        int $userId,
        string $reason,
        ?string $notes,
    ): ?CashRegisterTransaction {
        $existing = CashRegisterTransaction::query()->where('idempotency_key', $key)->first();
        if (! $existing) {
            return null;
        }

        if (
            $existing->type !== $type
            || $existing->direction !== $direction
            || $this->toCents((string) $existing->amount) !== $amountCents
            || $existing->user_id !== $userId
            || $existing->reason !== $reason
            || $existing->notes !== $notes
        ) {
            abort(409, 'The idempotency key has already been used for a different cash transaction.');
        }

        return $existing;
    }
}
