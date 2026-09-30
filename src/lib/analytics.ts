/**
 * Заготовка аналитики. [ID счётчиков — у заказчика]
 * Пока ID пустые, счётчики не подключаются, а цели пишутся в window.dataLayer.
 */
export const analytics = {
  ymId: '' as string, // Яндекс Метрика, например '12345678'
  gaId: '' as string, // GA4, например 'G-XXXXXXX'
};

/** Цели (значения data-goal в разметке) */
export const goals = {
  demoClick: 'demo_click', // клик «Запросить демо»
  aiClick: 'ai_launch_click', // клик «Узнать о запуске первым»
  formSubmit: 'demo_form_submit', // успешная отправка формы
} as const;
