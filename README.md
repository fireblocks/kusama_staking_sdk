# Fireblocks Kusama staking 

This script allows to stake KSM via the Fireblocks system using the RAW signing API feature.

**Prerequisites:**

1. Run `npm i` from the project's directory to install all needed dependencies.

2. Create the following vault accounts with KSM wallet within each:

    a. Stash Account - holds the amount to stake

    b. Controller Account - has the permissions to run nominations (should have balance of 25 KSM)

3. Enable RAW signing feature by contacting Fireblocks's support team

4. Set transaction authorization policy rule that governs the RAW signing operation, the policy should include the following parameters:

    a. Initiator

    b. Designated Signer

    c. Asset - KSM

    d. Source (vault accounts) - Optional

    e. Authorizers - Optional

**How to stake KSM**

1. addProxy(<controller_account_vault_account_id>, <proxy_ksm_address>);

2. bond(<stash_account_vault_account_id>, <amount_to_stake>, <controller_account_address>, **optional** - <reward_destination>);

reward_destination - Can be one of the following:

    1. Stash (Default)

    2. Staked - the rewards are sent back to the Stash and automatically bonded

    3. Controller - the rewards are sent back to the Controller account

**How to stake extra KSM**
1. bondExtra(<stash_account_vault_account_id>, <amount_to_bond>)

**How to stop staking**

1. If you want to unbond the **entire bonded** balance, run first: chill(<controller_account_vault_account_id>);

2. unbond(<controller_account_vault_account_id>, <amount_to_unbond>);

3. **28 days after** unbond() - withdrawUnbonded(<controller_account_vault_account_id>);

4. **Optional** - removeProxy(<controller_account_vault_account_id>, <proxy_ksm_address>);

**How to change controller**

1. setController(<vault_account_id>, <controller_address>)

