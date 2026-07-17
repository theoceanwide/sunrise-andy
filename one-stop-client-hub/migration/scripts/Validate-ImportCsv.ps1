<#
.SYNOPSIS
  Validates ready-to-import CSVs against One Stop Client Hub rules.

.EXAMPLE
  ./Validate-ImportCsv.ps1 -ClientsCsv ../sample-csvs/clients_ready.csv -AttendanceCsv ../sample-csvs/attendance_ready_202607.csv
#>

[CmdletBinding()]
param(
    [string] $ClientsCsv,
    [string] $AttendanceCsv,
    [string] $BillingCsv
)

$ErrorActionPreference = "Stop"
$errors = New-Object System.Collections.Generic.List[string]
$warnings = New-Object System.Collections.Generic.List[string]

function Assert-Unique {
    param($Rows, $Column, $Label)
    $dupes = $Rows | Group-Object $Column | Where-Object { $_.Count -gt 1 -and $_.Name }
    foreach ($d in $dupes) {
        $errors.Add("$Label duplicate $Column='$($d.Name)' count=$($d.Count)")
    }
}

if ($ClientsCsv) {
    $clients = Import-Csv $ClientsCsv
    Write-Host "Clients rows: $($clients.Count)"
    Assert-Unique -Rows $clients -Column "ClientNumber" -Label "Clients"
    Assert-Unique -Rows $clients -Column "SourceSystemId" -Label "Clients"
    foreach ($c in $clients) {
        if (-not $c.ClientNumber) { $errors.Add("Client missing ClientNumber (SourceSystemId=$($c.SourceSystemId))") }
        if (-not $c.FirstName -or -not $c.LastName) { $errors.Add("Client $($c.ClientNumber) missing name") }
        if ($c.Status -notin @("Active", "OnHold", "Discharged", "Prospective")) {
            $errors.Add("Client $($c.ClientNumber) invalid Status='$($c.Status)'")
        }
        if ($c.DateOfBirth -and $c.DateOfBirth -notmatch '^\d{4}-\d{2}-\d{2}$') {
            $errors.Add("Client $($c.ClientNumber) DOB not ISO: $($c.DateOfBirth)")
        }
        if ($c.Status -eq "Active" -and -not $c.MedicaidID -and $c.PrimaryPayerCode -like "MCD*") {
            $warnings.Add("Active Medicaid client $($c.ClientNumber) missing MedicaidID")
        }
    }
    $script:ClientNumbers = [System.Collections.Generic.HashSet[string]]::new([string[]]($clients.ClientNumber))
}

if ($AttendanceCsv) {
    $att = Import-Csv $AttendanceCsv
    Write-Host "Attendance rows: $($att.Count)"
    Assert-Unique -Rows $att -Column "SourceSystemId" -Label "Attendance"
    $att | Group-Object ClientNumber, AttendanceDate | Where-Object { $_.Count -gt 1 } | ForEach-Object {
        $errors.Add("Attendance duplicate ClientNumber+Date: $($_.Name)")
    }
    foreach ($a in $att) {
        if ($ClientNumbers -and -not $ClientNumbers.Contains($a.ClientNumber)) {
            $errors.Add("Attendance references unknown ClientNumber=$($a.ClientNumber)")
        }
        if ($a.Status -notin @("Present", "Absent", "Excused", "Holiday", "Partial")) {
            $errors.Add("Attendance $($a.SourceSystemId) invalid Status")
        }
        if ($a.AttendanceDate -notmatch '^\d{4}-\d{2}-\d{2}$') {
            $errors.Add("Attendance $($a.SourceSystemId) bad date")
        }
    }
}

if ($BillingCsv) {
    $bill = Import-Csv $BillingCsv
    Write-Host "Billing rows: $($bill.Count)"
    Assert-Unique -Rows $bill -Column "SourceSystemId" -Label "Billing"
    $sum = 0
    foreach ($b in $bill) {
        if ($ClientNumbers -and -not $ClientNumbers.Contains($b.ClientNumber)) {
            $errors.Add("Billing references unknown ClientNumber=$($b.ClientNumber)")
        }
        $amt = 0
        if (-not [decimal]::TryParse($b.Amount, [ref]$amt)) {
            $errors.Add("Billing $($b.SourceSystemId) Amount not numeric")
        }
        else { $sum += $amt }
        if ($b.Status -eq "Denied" -and -not $b.DenialReason) {
            $warnings.Add("Denied claim $($b.SourceSystemId) missing DenialReason")
        }
    }
    Write-Host ("Billing Amount total: {0:N2}" -f $sum)
}

Write-Host ""
Write-Host "WARNINGS ($($warnings.Count))"
$warnings | ForEach-Object { Write-Host "  - $_" }
Write-Host "ERRORS ($($errors.Count))"
$errors | ForEach-Object { Write-Host "  - $_" }

if ($errors.Count -gt 0) { exit 1 } else { exit 0 }
