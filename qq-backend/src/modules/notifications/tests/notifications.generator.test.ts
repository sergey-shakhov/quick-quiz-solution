import { writeFileSync } from 'fs';
import { generate, NotificationContent } from '../notifications.generator';

describe('Notifications > Report', () => {
  it('should be generated successfully', () => {
    const content: NotificationContent = {
      status: 'neutral',
      subject: 'Иван Иванов успешно прошёл тест',
      summary: 'Сотрудник Иван Иванов успешно прошёл тест с результатом 87%',
      action: {
        text: 'Перейти к тестированию',
        href: 'https://example.com/quiz/3745678346763485',
      },
      params: [
        {
          key: 'Время прохождения теста',
          value: '2 часа 5 минут',
        },
        {
          key: 'Количество вопросов',
          value: '25',
        },
        {
          key: 'Способ завершения',
          value: 'Времени хватило, сотрудник завершил сам',
        },
      ],
      details: 'Результат получился очень хороший. Результат получился очень хороший. Результат получился очень хороший. ',
      tableData: [[1, 'mobx', true], [2, 'react, typescript', false], [3, 'devops', undefined]],
      conclusion: 'Сотруднику стоит получше изучить MobX',
    };
    const html = generate(content);

    expect(html.indexOf('<html')).toBeGreaterThanOrEqual(0);
    expect(html.indexOf('Сотрудник Иван Иванов')).toBeGreaterThanOrEqual(0);
    
  });
});
