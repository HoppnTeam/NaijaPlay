create or replace function buy_player(
  p_team_id uuid,
  p_player_id uuid,
  p_price bigint
)
returns void
language plpgsql
security definer
as $$
begin
  -- Start transaction
  begin
    -- Update team budget
    update teams
    set budget = budget - p_price
    where id = p_team_id
    and budget >= p_price;

    if not found then
      raise exception 'Insufficient funds or team not found';
    end if;

    -- Add player to team
    insert into team_players (
      team_id,
      player_id,
      is_captain,
      is_vice_captain,
      for_sale,
      purchase_price
    )
    values (
      p_team_id,
      p_player_id,
      false,
      false,
      false,
      p_price
    );

    -- Update player availability
    update players
    set is_available = false
    where id = p_player_id;

    -- Commit transaction
    commit;
  exception
    when others then
      -- Rollback transaction on error
      rollback;
      raise;
  end;
end;
$$; 