<!-- © 2026 Global Infrastructure Advisory | GISA-EWO-v1 -->

<div class="emergency-header" style="border: 4px solid #d9534f; padding: 20px;">
  <h1 style="color: #d9534f;">⚠️ EMERGENCY WORK ORDER</h1>
  <p><strong>ISSUE DATE:</strong> <span id="current-date"></span></p>
  <p><strong>PRIORITY:</strong>
    <span style="background: #d9534f; color: #fff; padding: 5px;">
      RANK 1: MISSION CRITICAL
    </span>
  </p>
</div>

<div class="project-details">
  <h3>LOCATION DATA</h3>
  <p><strong>FACILITY ID:</strong> {{project_id}}</p>
  <p><strong>COORDINATES:</strong> {{lat}}, {{lon}}</p>
  <p><strong>SECTOR:</strong> {{sector}}</p>
</div>

<div class="authorized-personnel">
  <h3>ASSIGNED CONTRACTOR</h3>
  <p><strong>NAME:</strong> {{worker_name}}</p>
  <p><strong>AUTH CODE:</strong> GIA-BACKUP-{{auth_token}}</p>
</div>
<script>
  document.getElementById('current-date').innerText = new Date().toLocaleString();
</script>