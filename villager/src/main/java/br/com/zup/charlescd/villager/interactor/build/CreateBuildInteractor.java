/*
 * This Source Code Form is subject to the terms of the
 * Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed
 * with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package br.com.zup.charlescd.villager.interactor.build;

import javax.validation.Valid;

@FunctionalInterface
public interface CreateBuildInteractor {

    NewBuildDTO execute(@Valid CreateBuildInput input, String circleId);

}