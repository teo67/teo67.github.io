class Command {
    constructor(_name, _description, _arguments, _requirements) {
        this.name = _name;
        this.description = _description;
        this.arguments = _arguments;
        this.requirements = _requirements;
    }
}

const commands = [
    new Command(
        'allmoves',
        'This command prints a list of all learned moves on the Discit currently selected.',
        '',
        'Have an account, have a Discit selected (check out the \'select\' command)'
    ),
    new Command(
        'battle',
        'This command challenges another user on your server to a battle.',
        '[@player] [coin wager]',
        'Have an account, be in a Discit Station, have Discits in your party, not currently in combat (all of these apply to your opponent too), wager is above 0 but not more than either person has'
    ),
    new Command(
        'buy',
        'Purchase an item from the shop.',
        '[amount to buy (optional)] [item name]',
        'Has an account, is not in combat, is in a Discit Station, has enough coins to purchase item'
    ),
    new Command(
        'choose',
        'Choose a starter Discit between Koulit, Leafid, and Ferenhyde.',
        '[name of chosen Discit]',
        'Have an account, hasn\'t chosen a starter yet'
    ),
    new Command(
        'coins',
        'This command checks your current coin balance. Coins can be used to purchase items and to battle other players.',
        '',
        'Has registered for an account'
    ),
    new Command(
        'equip',
        'This command equips an attack on the Discit you currently have selected.',
        '[index of new attack in the full list (use \'allmoves\')] [attack slot (1 - 4)]',
        'Have an account, be in a Discit Station, have a Discit selected, can\'t be used during combat, can\'t equip the same move more than once'
    ),
    new Command(
        'help',
        'Prints a list of commands or the description of a specific command.',
        '[name of command (optional)]',
        'None'
    ),
    new Command(
        'inventory',
        'This command will print out a list of items in your inventory. If you specify a page in your inventory, you can find items more easily.',
        '[inventory page (optional)]',
        'Has registered for an account'
    ),
    new Command(
        'item',
        'This command allows you to use an item from your inventory while not in battle.',
        '[index of item in your inventory] [index of Discit in party to use it on (only required for some items)]',
        'Has an account, is not in combat, item is usable'
    ),
    new Command(
        'list',
        'This command prints a list of every Discit you own and the index of that Discit.',
        '',
        'Has registered for an account'
    ),
    new Command(
        'map',
        'This command prints out a map of your surroundings. You can then press the arrow buttons to move in those directions. Sometimes you\'ll run into trainers or wild Discits, and then you\'ll enter combat with them.',
        '',
        'Has registered for an account, can\'t use while in combat'
    ),
    new Command(
        'moves',
        'This command prints a list of the moves that are currently equipped on the selected Discit. It will also give a short description of each attack.',
        '',
        'Have an account, have a Discit selected'
    ),
    new Command(
        'nickname',
        'This command edits the nickname on the Discit you currently have equipped.',
        '[new name]',
        'Have an account, have a Discit selected'
    ),
    new Command(
        'party',
        'This command can be used to view and edit your party. If you supply two integer arguments, you can add a Discit to your party. Otherwise, this command will show you the discits in your party.',
        '[index of added Discit (use \'list\') (optional)] [party slot (between 1 and 6) (also optional)]',
        'Have an account. Requirements for editing your party: Be in a Discit Station, the chosen Discit has attacks equipped, can\'t be used during combat, can\'t equip the same Discit more than once'
    ),
    new Command(
        'partyselect',
        'This command selects a Discit you own so that you can change its nickname, equip attacks, etc.',
        '[index of Discit in your party (use \'party\' with no arguments)]',
        'Have an account, can\'t be used while in combat (your selected Discit in combat counts as the one that is currently fighting)'
    ),
    new Command(
        'profile',
        'This command will show you some helpful information such as your location and the number of Discits you\'ve caught.',
        '',
        'Has registered for an account'
    ),
    new Command(
        'register',
        'This should be the very first command that you use, as it will register you for an account',
        '',
        'Doesn\'t have an account already'
    ),
    new Command(
        'select',
        'This command selects a Discit you own so that you can change its nickname, equip attacks, etc.',
        '[index of Discit in your collection (use \'list\')]',
        'Have an account, can\'t be used while in combat (your selected Discit in combat counts as the one that is currently fighting)'
    ),
    new Command(
        'shop',
        'View a list of items and their prices in the shop. There\'s also a second page, which has a few extra items.',
        '[page number (optional)]',
        'Has an account, is not in combat, is in a Discit Station'
    ),
    new Command(
        'stats',
        'This command will print out the stats of the Discit you currently have equipped. These include individual and effort values, as well as things like HP and effects.',
        '',
        'Have an account, have a Discit selected'
    ),
    new Command(
        'switch',
        'Swap around the positions of two Discits in your party.',
        '[index of Discit #1 in your party] [index of Discit #2 in your party]',
        'Have an account, can\'t be used while in combat, both arguments should be positive integers that refer to slots in your party'
    ),
    new Command(
        'warp',
        'Using the warp ring, teleport to any location you wish!',
        '[location (example: Route 1)]',
        'Has an account, is not currently in battle'
    )
];

