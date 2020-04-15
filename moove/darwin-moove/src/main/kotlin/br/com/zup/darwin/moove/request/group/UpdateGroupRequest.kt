/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

package br.com.zup.darwin.moove.request.group

import javax.validation.constraints.NotBlank
import javax.validation.constraints.NotEmpty

data class UpdateGroupRequest(

    @field:NotBlank
    val name: String,

    @field:NotEmpty
    val roleIds: List<String>

)