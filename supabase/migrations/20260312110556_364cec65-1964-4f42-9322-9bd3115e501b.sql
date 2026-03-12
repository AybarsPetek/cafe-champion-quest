
CREATE OR REPLACE FUNCTION public.submit_quiz(
  p_attempt_id uuid,
  p_user_id uuid,
  p_quiz_id uuid,
  p_answers jsonb,
  p_time_spent integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_total_score integer := 0;
  v_total_points integer := 0;
  v_passing_score integer;
  v_score_percentage integer;
  v_passed boolean;
  v_answer jsonb;
  v_question_id uuid;
  v_selected_option_id uuid;
  v_is_correct boolean;
  v_points integer;
BEGIN
  -- Verify the attempt belongs to the user
  IF NOT EXISTS (
    SELECT 1 FROM user_quiz_attempts
    WHERE id = p_attempt_id AND user_id = p_user_id AND quiz_id = p_quiz_id
  ) THEN
    RAISE EXCEPTION 'Invalid attempt';
  END IF;

  -- Get passing score
  SELECT passing_score INTO v_passing_score
  FROM quizzes WHERE id = p_quiz_id;

  -- Calculate total possible points
  SELECT COALESCE(SUM(points), 0) INTO v_total_points
  FROM quiz_questions WHERE quiz_id = p_quiz_id;

  -- Process each answer
  FOR v_answer IN SELECT * FROM jsonb_array_elements(p_answers)
  LOOP
    v_question_id := (v_answer->>'questionId')::uuid;
    v_selected_option_id := (v_answer->>'selectedOptionId')::uuid;

    -- Check if correct
    SELECT is_correct INTO v_is_correct
    FROM quiz_options
    WHERE id = v_selected_option_id AND question_id = v_question_id;

    -- Get question points
    SELECT points INTO v_points
    FROM quiz_questions WHERE id = v_question_id;

    IF v_is_correct THEN
      v_total_score := v_total_score + COALESCE(v_points, 0);
    END IF;

    -- Insert answer record
    INSERT INTO user_quiz_answers (attempt_id, question_id, selected_option_id, is_correct, points_earned)
    VALUES (p_attempt_id, v_question_id, v_selected_option_id, COALESCE(v_is_correct, false), CASE WHEN v_is_correct THEN v_points ELSE 0 END);
  END LOOP;

  -- Calculate percentage and pass status
  IF v_total_points > 0 THEN
    v_score_percentage := ROUND((v_total_score::decimal / v_total_points::decimal) * 100);
  ELSE
    v_score_percentage := 0;
  END IF;
  v_passed := v_score_percentage >= v_passing_score;

  -- Update the attempt
  UPDATE user_quiz_attempts
  SET completed_at = now(),
      score = v_total_score,
      total_points = v_total_points,
      passed = v_passed,
      time_spent_seconds = p_time_spent
  WHERE id = p_attempt_id;

  RETURN jsonb_build_object(
    'score', v_total_score,
    'total_points', v_total_points,
    'passed', v_passed,
    'scorePercentage', v_score_percentage
  );
END;
$$;
