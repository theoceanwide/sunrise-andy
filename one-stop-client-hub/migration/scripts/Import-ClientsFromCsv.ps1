<#
.SYNOPSIS
  Upserts Clients list items from a ready CSV using PnP.PowerShell.

.EXAMPLE
  Connect-PnPOnline -Url "https://contoso.sharepoint.com/sites/OneStopClientHub" -Interactive
  ./Import-ClientsFromCsv.ps1 -CsvPath ../sample-csvs/clients_ready.csv -WhatIf
#>

[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [Parameter(Mandatory = $true)]
    [string] $CsvPath,

    [string] $ListTitle = "Clients"
)

$ErrorActionPreference = "Stop"
$rows = Import-Csv -Path $CsvPath
$success = 0
$failed = 0

# Prefetch centers for lookup IDs
$centers = Get-PnPListItem -List "Centers" -PageSize 100
$centerMap = @{}
foreach ($c in $centers) {
    $code = $c["CenterCode"]
    if ($code) { $centerMap[$code] = $c.Id }
}

foreach ($r in $rows) {
    try {
        $existing = Get-PnPListItem -List $ListTitle -PageSize 1 -Query @"
<View>
  <Query>
    <Where>
      <Eq>
        <FieldRef Name='SourceSystemId'/>
        <Value Type='Text'>$($r.SourceSystemId)</Value>
      </Eq>
    </Where>
  </Query>
  <RowLimit>1</RowLimit>
</View>
"@

        $centerId = $null
        if ($r.CenterCode -and $centerMap.ContainsKey($r.CenterCode)) {
            $centerId = $centerMap[$r.CenterCode]
        }

        $values = @{
            Title          = "$($r.LastName), $($r.FirstName)"
            ClientNumber   = $r.ClientNumber
            SourceSystemId = $r.SourceSystemId
            FirstName      = $r.FirstName
            LastName       = $r.LastName
            PreferredName  = $r.PreferredName
            Status         = $r.Status
            MedicaidID     = $r.MedicaidID
            Phone          = $r.Phone
            City           = $r.City
            State          = $r.State
            PostalCode     = $r.PostalCode
            AddressLine1   = $r.AddressLine1
            MobilityLevel  = $r.MobilityLevel
            Allergies      = $r.Allergies
            DietaryNeeds   = $r.DietaryNeeds
            DiagnosisPrimary = $r.DiagnosisPrimary
            TransportNotes = $r.TransportNotes
            LastSyncedAt   = (Get-Date).ToUniversalTime()
        }

        if ($r.DateOfBirth) { $values["DateOfBirth"] = [datetime]$r.DateOfBirth }
        if ($r.EnrollmentDate) { $values["EnrollmentDate"] = [datetime]$r.EnrollmentDate }
        if ($r.DischargeDate) { $values["DischargeDate"] = [datetime]$r.DischargeDate }
        if ($r.AuthorizedHoursPerDay) { $values["AuthorizedHoursPerDay"] = [decimal]$r.AuthorizedHoursPerDay }
        if ($r.TransportNeeded) { $values["TransportNeeded"] = ($r.TransportNeeded -eq "true") }
        if ($centerId) { $values["Center"] = $centerId }

        $target = if ($existing) { "Update $($r.ClientNumber)" } else { "Create $($r.ClientNumber)" }
        if ($PSCmdlet.ShouldProcess($target)) {
            if ($existing) {
                Set-PnPListItem -List $ListTitle -Identity $existing.Id -Values $values | Out-Null
            }
            else {
                Add-PnPListItem -List $ListTitle -Values $values | Out-Null
            }
            $success++
        }
    }
    catch {
        Write-Warning "Failed $($r.ClientNumber): $_"
        $failed++
    }
}

Write-Host "Done. Success=$success Failed=$failed Total=$($rows.Count)"
