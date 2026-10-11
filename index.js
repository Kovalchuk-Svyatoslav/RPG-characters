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



// Парсинг аргументів командного рядка
program.parse(process.argv);