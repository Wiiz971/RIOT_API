#ifndef INC_TIMER_H_
#define INC_TIMER_H_

void TIM5_set_periodic_event(uint32_t ms);
void TIM5_wait_for_periodic_event(void);
void TIM5_clear_periodic_event(void);
uint32_t TIM5_test_periodic_event(void);

void TIM2_Led_pwm_init(void);
void TIM2_Led_pwm_set(uint32_t value);
uint32_t TIM2_Led_pwm_get();

void TIM4_init(uint32_t frequ);
uint32_t TIM4_pulse_capture(void);
int32_t TIM4_wait_for_pulse_capture_poll(void);
uint32_t TIM4_get_pulse(void);

#endif /* INC_TIMER_H_ */
