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

// Команда 2: Виведення одного елемента (Загальна можливість 2)
program
  .command('character <name>')
  .description('Виводить повну інформацію про конкретного персонажа за його іменем')
  .action((name, options) => {

    const data = readData();

    // Пошук персонажа в масиві (ігноруємо великі/малі літери для зручності)
    const character = data.find(char => char.name.toLowerCase() === name.toLowerCase());

    // Обробка помилки, якщо персонаж не знайдено
    if (!character) {
      console.error(`Помилка: Персонажа з іменем "${name}" не знайдено.`);
      process.exit(1);
    }

    // Виведення всього об'єкту цілком
    console.log(`--- Повні дані персонажа: ${character.name} ---`);
    console.log(JSON.stringify(character, null, 2));
  });

// Команда 3: Виведення значення окремого поля (Загальна можливість 3)
program
  .command('field <name> <path>')
  .description('Виводить значення окремого поля персонажа (вкладені поля вказуйте через крапку, напр.: basic_characteristics.damage)')
  .action((name, path) => {
    const data = readData();
    const character = data.find(char => char.name.toLowerCase() === name.toLowerCase());

    if (!character) {
      console.error(`Помилка: Персонажа з іменем "${name}" не знайдено.`);
      process.exit(1);
    }

    // Розбивання шляху на частини (наприклад, "basic_characteristics.damage" -> ["basic_characteristics", "damage"])
    const keys = path.split('.');
    let currentValue = character;
    let fieldExists = true;

    // Проходимось по кожному слову в шляху
    for (const key of keys) {
      // Перевірка, чи ми працюємо з об'єктом і чи існує в ньому такий ключ
      if (currentValue !== null && typeof currentValue === 'object' && key in currentValue) {
        currentValue = currentValue[key]; // Заглиблюємось далі
      } else {
        fieldExists = false;
        break; // Зупинка пошуку
      }
    }

    // Обробка результату (різниця між відсутнім полем і null)
    if (!fieldExists) {
      console.error(`Помилка: Поле "${path}" взагалі не існує у персонажа "${character.name}".`);
      process.exit(1);
    }

    if (currentValue === null) {
      console.log(`Поле "${path}" існує, але воно порожнє (null).`);
    } else if (typeof currentValue === 'object') {
      // Якщо поле містить цілий об'єкт або масив (наприклад, inventory)
      console.log(`Значення поля "${path}":\n${JSON.stringify(currentValue, null, 2)}`);
    } else {
      // Якщо це звичайне число або текст
      console.log(`Значення поля "${path}": ${currentValue}`);
    }
  });

// Команда 4: Характеристики персонажа (Варіант 8, можливість 1)
program
  .command('stats <name>')
  .description('Виводить рівень та базові характеристики обраного персонажа')
  .action((name) => {
    const data = readData();
    
    // Пошук персонажа
    const character = data.find(char => char.name.toLowerCase() === name.toLowerCase());

    if (!character) {
      console.error(`Помилка: Персонажа з іменем "${name}" не знайдено.`);
      process.exit(1);
    }

    // Виведення рівня та базових характеристик
    console.log(`--- Статистика: ${character.name} ---`);
    console.log(`Рівень персонажа: ${character.level}`);
    console.log('Базові характеристики:');
    console.log(JSON.stringify(character.basic_characteristics, null, 2));
  });

// Команда 5: Інвентар персонажа (Варіант 8, можливість 2)
program
  .command('inventory <name>')
  .description('Виводить інвентар персонажа з можливістю фільтрації')
  .option('-e, --equipped', 'показати лише ті предмети, які зараз одягнені')
  .option('-p, --purpose <keyword>', 'відфільтрувати за призначенням (пошук по назві або властивостях)')
  .action((name, options) => {
    const data = readData();
    const character = data.find(char => char.name.toLowerCase() === name.toLowerCase());

    if (!character) {
      console.error(`Помилка: Персонажа з іменем "${name}" не знайдено.`);
      process.exit(1);
    }

    let items = character.inventory;

    // Фільтр за екіпіруванням
    if (options.equipped) {
      items = items.filter(item => item.equipped === true);
    }

    // Фільтр за призначенням
    if (options.purpose) {
      const keyword = options.purpose.toLowerCase();
      
      items = items.filter(item => {
        // Пошук ключового слова в назві, полі ability або effect
        const matchName = item.name && item.name.toLowerCase().includes(keyword);
        const matchAbility = item.ability && item.ability.toLowerCase().includes(keyword);
        const matchEffect = item.effect && item.effect.toLowerCase().includes(keyword);
        
        return matchName || matchAbility || matchEffect;
      });
    }

    console.log(`--- Інвентар: ${character.name} ---`);
    if (items.length === 0) {
      console.log('За вашими критеріями предметів не знайдено.');
    } else {
      console.log(JSON.stringify(items, null, 2));
    }
  });

// Команда 6: Навички персонажа (Варіант 8, можливість 3)
program
  .command('skills <name>')
  .description('Виводить список навичок персонажа з можливістю пошуку')
  .option('-s, --search <word>', 'знайти навичку за ключовим словом у назві або описі (ability)')
  .action((name, options) => {
    const data = readData();
    const character = data.find(char => char.name.toLowerCase() === name.toLowerCase());

    if (!character) {
      console.error(`Помилка: Персонажа з іменем "${name}" не знайдено.`);
      process.exit(1);
    }

    let skills = character.skills;

    // Перевірка: чи існує масив навичок і чи він не порожній
    if (!skills || skills.length === 0) {
      console.log(`У персонажа "${character.name}" ще немає жодних навичок.`);
      return;
    }

    // Фільтр за ключовим словом
    if (options.search) {
      const keyword = options.search.toLowerCase();
      
      // Шукаємо збіги в name або ability
      skills = skills.filter(skill => {
        const matchName = skill.name && skill.name.toLowerCase().includes(keyword);
        const matchAbility = skill.ability && skill.ability.toLowerCase().includes(keyword);
        
        return matchName || matchAbility;
      });
    }

    // Виведення результату
    console.log(`--- Навички: ${character.name} ---`);
    if (skills.length === 0) {
      console.log(`Навичок із ключовим словом "${options.search}" не знайдено.`);
    } else {
      console.log(JSON.stringify(skills, null, 2));
    }
  });

// Парсинг аргументів командного рядка
program.parse(process.argv);