# Fireblocks Kusama staking 

This script allows to stake KSM via the Fireblocks system using the RAW signing API feature.

## :warning: Breaking Change in 2.0.0 :warning:
Version 2.0.0 introduces a breaking change; as per [this forum post](https://forum.polkadot.network/t/staking-controller-deprecation-plan-staking-ui-leads-comms/2748) on Polkadot - the controller is being deprecated.<br>
As a result the following breaking changes were introduced:
* The function `setController` will no longer work and will results in an error
* The function `bond` no longer accepts 4 arguments, instead only 3 arguments - `vaultAccountId: string, amount?: number, rewardDestination?: string` (the `controller` argument was removed)

**Prerequisites:**

1. Run `npm i` from the project's directory to install all needed dependencies.

2. Create the following vault accounts with KSM wallet which will act as a stash and controller Account

3. Enable RAW signing feature by contacting Fireblocks's support team

4. Set transaction authorization policy rule that governs the RAW signing operation, the policy should include the following parameters:

    a. Initiator

    b. Designated Signer

    c. Asset - KSM

    d. Source (vault accounts) - Optional

    e. Authorizers - Optional

**How to stake KSM**

1. addProxy(<stake_account_vault_account_id>, <proxy_ksm_address>);

2. bond(<stash_account_vault_account_id>, <amount_to_stake>, **optional** - <reward_destination>);

reward_destination - Can be one of the following:

    1. Stash (Default)

    2. Staked - the rewards are sent back to the Stash and automatically bonded

**How to stake extra KSM**
1. bondExtra(<stash_account_vault_account_id>, <amount_to_bond>)

**How to stop staking**

1. chill(<stake_account_vault_account_id>);

2. unbond(<stake_account_vault_account_id>, <amount_to_unbond>);

3. **7 days after** unbond() - withdrawUnbonded(<stake_account_vault_account_id>);

4. **Optional** - removeProxy(<stake_account_vault_account_id>, <proxy_ksm_address>);

**How to change controller**

1. setController(<stash_vault_account_id>, <controller_address>)

