-- Verificar se o job foi criado
select * from cron.job;

-- Verificar execuções recentes (se houver)
select * from cron.job_run_details 
where jobname = 'downgrade-expired-access'
order by start_time desc
limit 10;

-- Ver se a função existe
select 
  routine_name,
  routine_type,
  data_type
from information_schema.routines
where routine_schema = 'public'
  and routine_name = 'downgrade_expired_access';
