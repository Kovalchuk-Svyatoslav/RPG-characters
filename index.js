import { Command } from 'commander';
import fs from 'fs';

const program = new Command();

// Опис програми
program
  .name('rpg-cli')
  .description('CLI-програма для роботи з даними RPG-персонажів')
  .version('1.0.0');

// Глобальна опція для шляху до файлу
program.option('-f, --file <path>', 'шлях до JSON-файлу з даними', 'data.json');

// Допоміжна функція для читання та перевірки файлу
function readData() {
  const options = program.opts(); // Отримуємо значення глобальних опцій
  const filePath = options.file;

  try {
    // Перевірка, чи існує файл
    if (!fs.existsSync(filePath)) {
      console.error(`Помилка: Файл "${filePath}" не знайдено.`);
      process.exit(1); // Завершення програми з кодом помилки
    }
    
    // Читання та парсинг файлу
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    // Обробка помилок парсингу (якщо JSON некоректний)
    console.error(`Помилка: Не вдалося прочитати JSON з файлу "${filePath}". Перевірте синтаксис.`);
    process.exit(1);
  }
}

// Команда 1: Виведення списку персонажів (Загальна можливість 1)
program
  .command('list')
  .description('Виводить короткий список персонажів (ім\'я, клас, рівень)')
  .option('-l, --limit <number>', 'обмежити кількість виведених персонажів')
  .action((options) => {
    // Отримання всіх даних з файлу
    const data = readData();
    let characters = data;

    // Обробка ліміту, якщо користувач його вказав
    if (options.limit) {
      const limitValue = parseInt(options.limit, 10); // Перетворення тексту на число

      // Перевірка на помилки: чи це взагалі число і чи воно більше нуля
      if (isNaN(limitValue) || limitValue <= 0) {
        console.error('Помилка: значення ліміту має бути додатним цілим числом.');
        process.exit(1);
      }

      // Обрізання масиву до вказаної кількості
      characters = data.slice(0, limitValue);
    }

    // 3. Виведення результату
    if (characters.length === 0) {
      console.log('Список персонажів порожній.');
      return;
    }

    console.log('--- Список персонажів ---');
    characters.forEach((char, index) => {
      console.log(`${index + 1}. ${char.name} | Клас: ${char.class} | Рівень: ${char.level}`);
    });
  });

// Парсинг аргументів командного рядка
program.parse(process.argv);