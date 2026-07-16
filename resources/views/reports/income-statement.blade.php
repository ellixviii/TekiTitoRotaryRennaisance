<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:DejaVu Sans,sans-serif;color:#1f2937}h1{color:#17458f}table{width:100%;border-collapse:collapse}th,td{padding:8px;border-bottom:1px solid #ddd;text-align:left}.number{text-align:right}.total{font-weight:bold}</style></head><body>
<h1>Rotary Club of Taytay Renaissance</h1><h2>Income Statement</h2><p>{{ $from }} to {{ $to }} · Asia/Manila</p>
@php($revenue=0) @php($expenses=0)
<table><thead><tr><th>Account</th><th>Type</th><th class="number">Amount</th></tr></thead><tbody>
@foreach($rows as $row) @php($amount=$row->type==='revenue'?(float)$row->credits-(float)$row->debits:(float)$row->debits-(float)$row->credits) @php($row->type==='revenue'?$revenue+=$amount:$expenses+=$amount)
<tr><td>{{ $row->code }} — {{ $row->name }}</td><td>{{ ucfirst($row->type) }}</td><td class="number">PHP {{ number_format($amount,2) }}</td></tr>@endforeach
<tr class="total"><td colspan="2">Net income</td><td class="number">PHP {{ number_format($revenue-$expenses,2) }}</td></tr></tbody></table>
<p>Generated {{ now()->format('M j, Y g:i A') }}</p></body></html>
