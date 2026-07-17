<#
.SYNOPSIS
  Provisions the One Stop Client Hub SharePoint site structure for Sunrise Senior Daycare.

.DESCRIPTION
  Creates document libraries and folder scaffolding. List columns are defined in
  ../../schemas/lists.json — apply via PnP template or manual list creation for Phase 1.

.NOTES
  Prerequisites:
    - PnP.PowerShell module
    - SharePoint Admin or Site Collection Admin
    - Interactive or app-only auth with Sites.FullControl.All (app-only) as appropriate

  Example:
    Connect-PnPOnline -Url "https://contoso.sharepoint.com" -Interactive
    ./Create-ClientHub.ps1 -TenantSiteUrl "https://contoso.sharepoint.com" -SiteUrl "https://contoso.sharepoint.com/sites/OneStopClientHub"
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string] $TenantSiteUrl,

    [Parameter(Mandatory = $true)]
    [string] $SiteUrl,

    [string] $SiteTitle = "One Stop Client Hub",

    [string[]] $CenterCodes = @("DEN", "HOU"),

    [switch] $SkipSiteCreation
)

$ErrorActionPreference = "Stop"

function Ensure-Library {
    param([string] $Title, [string] $Url)
    $lib = Get-PnPList -Identity $Title -ErrorAction SilentlyContinue
    if (-not $lib) {
        New-PnPList -Title $Title -Template DocumentLibrary -Url $Url | Out-Null
        Write-Host "Created library: $Title"
    }
    else {
        Write-Host "Library exists: $Title"
    }
}

function Ensure-Folder {
    param([string] $LibraryRelativeUrl, [string] $FolderPath)
    $full = "$LibraryRelativeUrl/$FolderPath"
    Resolve-PnPFolder -SiteRelativePath $full -ErrorAction SilentlyContinue | Out-Null
    Add-PnPFolder -Name (Split-Path $FolderPath -Leaf) -Folder (Split-Path "$LibraryRelativeUrl/$FolderPath" -Parent) -ErrorAction SilentlyContinue | Out-Null
}

Write-Host "Connecting to tenant root for site ensure..."
Connect-PnPOnline -Url $TenantSiteUrl -Interactive

if (-not $SkipSiteCreation) {
    $existing = Get-PnPTenantSite -Url $SiteUrl -ErrorAction SilentlyContinue
    if (-not $existing) {
        Write-Host "Creating site: $SiteUrl"
        New-PnPSite -Type TeamSiteWithoutMicrosoft365Group -Title $SiteTitle -Url $SiteUrl -Wait | Out-Null
    }
}

Connect-PnPOnline -Url $SiteUrl -Interactive
Write-Host "Connected to $SiteUrl"

# Libraries
Ensure-Library -Title "ClientDocuments" -Url "ClientDocuments"
Ensure-Library -Title "01-Staging" -Url "01-Staging"
Ensure-Library -Title "02-Compliance" -Url "02-Compliance"
Ensure-Library -Title "03-SOPs" -Url "03-SOPs"
Ensure-Library -Title "04-Forms-Templates" -Url "04-Forms-Templates"
Ensure-Library -Title "05-PowerBI-Exports" -Url "05-PowerBI-Exports"

# Enable versioning on ClientDocuments
Set-PnPList -Identity "ClientDocuments" -EnableVersioning $true -MajorVersions 50

# Staging folders
$stagingFolders = @(
    "Imports/raw",
    "Imports/working",
    "Imports/ready",
    "Imports/processed",
    "Imports/failed",
    "Manual-Uploads",
    "_Archive"
)
foreach ($f in $stagingFolders) {
    Ensure-Folder -LibraryRelativeUrl "01-Staging" -FolderPath $f
}

# Compliance folders
$complianceFolders = @(
    "CDPHE", "HHSC", "Licensing", "Incident-Reports-Registry",
    "Medicaid-Audits", "Policies", "Training-Evidence"
)
foreach ($f in $complianceFolders) {
    Ensure-Folder -LibraryRelativeUrl "02-Compliance" -FolderPath $f
}

# SOP folders
$sopFolders = @("Transport", "Clinical", "Intake", "Program", "Kitchen", "Billing")
foreach ($f in $sopFolders) {
    Ensure-Folder -LibraryRelativeUrl "03-SOPs" -FolderPath $f
}

# Center roots under ClientDocuments
$clientSubfolders = @(
    "01-Intake", "02-Assessments", "03-CarePlans", "04-Consents",
    "05-Medical", "06-Billing", "07-Incidents", "08-Correspondence"
)
foreach ($center in $CenterCodes) {
    Ensure-Folder -LibraryRelativeUrl "ClientDocuments" -FolderPath $center
    # Placeholder README so empty center folders sync
    $readmePath = "ClientDocuments/$center/README.txt"
    # Client folders are created by PA-01 per client
}

Write-Host @"

Provisioning complete (libraries + folders).

NEXT STEPS:
  1. Create lists from schemas/lists.json (PnP template or UI).
  2. Break inheritance on 01-Staging — Admins + Automation only.
  3. Apply sensitivity label 'Confidential - PHI' to ClientDocuments.
  4. Add Entra security groups to site permissions.
  5. Deploy Power Automate solution SunriseClientHub.
  6. Seed Centers (DEN/HOU) and Payers manually.

Client subfolder template (created by flow PA-01):
  $($clientSubfolders -join ', ')
"@
